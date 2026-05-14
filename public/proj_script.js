const searchBtn = document.getElementById("searchBtn");
const loadRecallsBtn = document.getElementById("loadRecallsBtn");
const eventBtn = document.getElementById("eventBtn");
const input = document.getElementById("drugInput");
const suggestionsBox = document.getElementById("suggestions");

if (searchBtn) {
    searchBtn.addEventListener("click", getDrugInfo);
}

if (loadRecallsBtn) {
    loadRecallsBtn.addEventListener("click", loadRecalls);
}

if (eventBtn) {
    eventBtn.addEventListener("click", loadAdverseEvents);
}


if (input && suggestionsBox) {
    input.addEventListener("input", () => showSuggestions(input, suggestionsBox));

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "none";
        }
    });
}

const eventInput = document.getElementById("eventInput");
const eventSuggestions = document.getElementById("eventSuggestions");

if (eventInput && eventSuggestions) {
    eventInput.addEventListener("input", () => showSuggestions(eventInput, eventSuggestions));

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            eventSuggestions.innerHTML = "";
            eventSuggestions.style.display = "none";
        }
    });
}

function showSuggestions(targetInput, targetBox) {
    const query = targetInput.value.trim();

    if (query.length < 2) {
        targetBox.innerHTML = "";
        targetBox.style.display = "none";
        return;
    }

    const url = `/api/suggestions/${encodeURIComponent(query)}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log("API DATA:", data);

            let output = "";
            const seen = new Set();

            if (!data.results) {
                targetBox.innerHTML = "";
                targetBox.style.display = "none";
                return;
            }

            data.results.forEach((item) => {
                const name = item.openfda?.brand_name?.[0];

                if (name && !seen.has(name)) {
                    seen.add(name);
                    output += `<div class="suggestion-item">${name}</div>`;
                }
            });

            if (output === "") {
                targetBox.innerHTML = "";
                targetBox.style.display = "none";
                return;
            }

            targetBox.innerHTML = output;
            targetBox.style.display = "block";

            document.querySelectorAll(".suggestion-item").forEach((item) => {
                item.addEventListener("click", () => {
                    targetInput.value = item.textContent;
                    targetBox.innerHTML = "";
                    targetBox.style.display = "none";
                });
            });
        })
        .catch((error) => {
            console.error("FETCH ERROR:", error);
            targetBox.innerHTML = "";
            targetBox.style.display = "none";
        });
}

function getDrugInfo() {
    const drugName = document.getElementById("drugInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (!drugName) {
        resultsDiv.innerHTML = "<p>Please enter a product name.</p>";
        return;
    }

    fetch('/api/searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drug_name: drugName })
    });

    const url = `/api/drug/${encodeURIComponent(drugName)}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("No product data found.");
            }
            return response.json();
        })
        .then((data) => {
            const result = data.results[0];

            const brand = result.openfda?.brand_name?.[0] || "N/A";
            const generic = result.openfda?.generic_name?.[0] || "N/A";
            const activeIngredient = result.active_ingredient?.[0] || "N/A";
            const purpose = result.purpose?.[0] || "N/A";
            const warnings = result.warnings?.[0] || "N/A";

            resultsDiv.innerHTML = `
                <div class="result-box">
                    <h3>${brand}</h3>
                    <p><strong>Generic Name:</strong> ${generic}</p>
                    <p><strong>Active Ingredient:</strong> ${activeIngredient}</p>
                    <p><strong>Purpose:</strong> ${purpose}</p>
                    <p><strong>Warnings:</strong> ${warnings}</p>
                </div>
            `;
        })
        .catch((error) => {
            resultsDiv.innerHTML = `<p>${error.message}</p>`;
            console.error("Drug label fetch error:", error);
        });
}

function loadRecalls() {
    const recallDiv = document.getElementById("recallResults");
    const url = "/api/recalls";

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Could not load recall data.");
            }
            return response.json();
        })
        .then((data) => {
            const recalls = data.results;
            let output = "";

            recalls.forEach((item) => {
                output += `
                    <div class="result-box">
                        <h3>${item.product_description || "No product name"}</h3>
                        <p><strong>Reason:</strong> ${item.reason_for_recall || "N/A"}</p>
                        <p><strong>Classification:</strong> ${item.classification || "N/A"}</p>
                        <p><strong>Recalling Firm:</strong> ${item.recalling_firm || "N/A"}</p>
                        <p><strong>Report Date:</strong> ${item.report_date || "N/A"}</p>
                    </div>
                `;
            });

            recallDiv.innerHTML = output;
        })
        .catch((error) => {
            recallDiv.innerHTML = `<p>${error.message}</p>`;
            console.error("Recall fetch error:", error);
        });
}

function loadAdverseEvents() {
    const productName = document.getElementById("eventInput").value.trim();
    const eventDiv = document.getElementById("eventResults");

    if (!productName) {
        eventDiv.innerHTML = "<p>Please enter a product name.</p>";
        return;
    }

    const url = `/api/events/${encodeURIComponent(productName)}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Could not load adverse event data.");
            }
            return response.json();
        })
        .then((data) => {
            const reactions = data.results.slice(0, 10);

            let output = `
                <div class="result-box">
                    <h3>Top Reported Reactions for ${productName}</h3>
                    <ul>
            `;

            reactions.forEach((item) => {
                output += `<li>${item.term}: ${item.count}</li>`;
            });

            output += `
                    </ul>
                </div>
            `;

            eventDiv.innerHTML = output;
        })
        .catch((error) => {
            eventDiv.innerHTML = `<p>${error.message}</p>`;
            console.error("Adverse event fetch error:", error);
        });
}

function loadRecentSearches() {
    const container = document.getElementById("recentSearches");
    if (!container) return;

    fetch('/api/searches')
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                container.innerHTML = `<p class="empty-state">No recent searches yet. <br><a href="search.html">Search a product</a> to get started.</p>`;
                return;
            }
            container.innerHTML = data
                .map(row => `<a href="search.html?q=${encodeURIComponent(row.drug_name)}" class="recent-search-tag">${row.drug_name}</a>`)
                .join("");
        })
        .catch(() => {
            container.innerHTML = `<p>Could not load recent searches.</p>`;
        });
}

loadRecentSearches();
