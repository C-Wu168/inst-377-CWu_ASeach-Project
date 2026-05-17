## Installation
Download these before starting: 
-Node.js
-create a Supabase account and create a new project

1. clone the repository and locate the folder
2. run npm install to install all dependencies
    - express, node-fetch,dotenv,@supabase/supabase-js
3. create and .env file and insert:
```  SUPABASE_URL=your_supabase_project_url  SUPABASE_KEY=your_supabase_anon_key PORT=3000 ```


4. In SUPABASE create a table with the columns :
    - id (int8, primary key) 
    - drug_name (text)
    - searched_at (timestamptz, default `now()`)
5. All of HTML, CSS and JS inside a public folder

## Running Double Check
paste into terminal:
``` node index.js```
open `http://localhost:3000` in your desired browser

## Testing
- Search a drug on Search section and see if a result appears
- See if recently searched products show up on home page
    - hover over a recently searched drug and confirm that quick look up table appears
- click ` Load Recent Recalls` and see if 5 results appear
- enter a drug on Adverse page and confirm the list of results and bar chart loads
    - enter a different and confirm that list of results and bar chart also loads

## API
GET : `/api/drug/:name` , Fetches FDA drug label info for a given brand name
GET : `/api/recalls`, Fetches five most recent FDA food recalls 
GET : `/api/events/:name`, Fetches top ten reported adverse reactions related to searched drug
GET : `/api/suggestions/:query`, Fetches a max of five brand name suggestions for suggested searches
GET : `/api/searches`, Returns five most recent searches within Supabase
POST : `/api/searches`, Saves searched drug into Supabase

| GET | `/api/searches` | Returns the 5 most recent searches saved in Supabase |
| POST | `/api/searches` | Saves a drug search to Supabase. Body: `{ "drug_name": "Tylenol" }` |

## Bugs
- Heavy use may hit openFDA'S request limit
- Searching the same drug may create duplicate rows in the Supabase database
- Potentially unable to search up certain drugs for Search and Adverse Events page

## Roadmap
- Add account and user authentication
    - utilize Supabase authentication so recently searched is by per user
- Register for a openFDA API key to avoid hitting the rate limit
- Improve the appearance and layout of application
    - edit layout for recalls table and adverse events chart
- Implement another JS library to change cursor icon to a little drug pill as the cursor instead of default