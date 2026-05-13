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


input.addEventListener("input", showSuggestions);

function showSuggestions() {
    const query = input.value.trim();

    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
        return;
    }

    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${query}*&limit=5`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log("API DATA:", data);

            let output = "";
            const seen = new Set();

            if (!data.results) {
                suggestionsBox.innerHTML = "";
                suggestionsBox.style.display = "none";
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
                suggestionsBox.innerHTML = "";
                suggestionsBox.style.display = "none";
                return;
            }

            suggestionsBox.innerHTML = output;
            suggestionsBox.style.display = "block";

            document.querySelectorAll(".suggestion-item").forEach((item) => {
                item.addEventListener("click", () => {
                    input.value = item.textContent;
                    suggestionsBox.innerHTML = "";
                    suggestionsBox.style.display = "none";
                });
            });
        })
        .catch((error) => {
            console.error("FETCH ERROR:", error);
            suggestionsBox.innerHTML = "";
            suggestionsBox.style.display = "none";
        });
}

searchBtn.addEventListener("click", getDrugInfo);

function getDrugInfo() {
    const drugName = document.getElementById("drugInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (!drugName) {
        resultsDiv.innerHTML = "<p>Please enter a product name.</p>";
        return;
    }

    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`;

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


loadRecallsBtn.addEventListener("click", loadRecalls);

function loadRecalls() {
    const recallDiv = document.getElementById("recallResults");
    const url = "https://api.fda.gov/food/enforcement.json?limit=5&sort=report_date:desc";

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


eventBtn.addEventListener("click", loadAdverseEvents);

function loadAdverseEvents() {
    const productName = document.getElementById("eventInput").value.trim();
    const eventDiv = document.getElementById("eventResults");

    if (!productName) {
        eventDiv.innerHTML = "<p>Please enter a product name.</p>";
        return;
    }

    const url = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${productName}"&count=patient.reaction.reactionmeddrapt.exact`;

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

