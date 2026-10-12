# Expense Tracker

A full-stack web application for tracking personal expenses. Users can add, view, edit, delete, and filter expenses by category. The dashboard displays the total amount, number of expenses, highest individual expense, and highest-spending category. Expense records are stored in PostgreSQL and accessed through a Node.js and Express API.

## How to run

### Backend

1. Install Node.js and PostgreSQL if they are not already installed.
2. Start PostgreSQL and open pgAdmin.
3. Create a database named `expense_tracker`.
4. In pgAdmin, select the `expense_tracker` database, open the Query Tool, open `backend/schema.sql`, and execute the SQL script.
5. In the `backend` folder, create a file named `.env` containing your local PostgreSQL settings:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=YOUR_POSTGRES_PASSWORD
   DB_NAME=expense_tracker
   ```

   Replace `YOUR_POSTGRES_PASSWORD` with your PostgreSQL password. Never upload or share `.env`.

6. Open the project folder (`expense-tracker-starter`) in Visual Studio Code.
7. Open a terminal and move into the backend folder:

   ```bash
   cd backend
   ```

8. Install the dependencies:

   ```bash
   npm install
   ```

9. Start the backend:

   ```bash
   node server.js
   ```

   The API should run at `http://localhost:3000`. Keep this terminal open while using the app.

### Frontend

1. In Visual Studio Code, open `frontend/index.html`.
2. If you have the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**. Otherwise, open the file in your browser.
3. Make sure the backend is still running. The frontend sends requests to `http://localhost:3000/api/expenses`.

## Features

- [x] Add an expense with validation
- [x] Delete an expense
- [x] Edit an expense
- [x] Filter by category
- [x] Summary cards (total amount, expense count, and highest expense)
- [x] Data is saved in a PostgreSQL database
- [x] Highest-spending category
- [x] Dark mode
- [x] Loading spinner and alerts

## Project structure

```text
expense-tracker-starter/
├── backend/
│   ├── package-lock.json
│   ├── package.json
│   ├── schema.sql
│   ├── server.js
│   └── .env                 # Create locally; do not upload
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── .gitignore
└── README.md
```

## Screenshots

Add 2–3 screenshots of the project before submitting. Save the images in a folder such as `screenshots/` at the project root, then use paths like these:

```markdown
![Expense Tracker desktop view](screenshots/desktop.png)
![Expense Tracker mobile view](screenshots/mobile.png)
```

## What was the hardest part?

The hardest part was connecting the frontend, backend, and PostgreSQL database so they worked together correctly. I solved this by sending HTTP requests from the frontend with `fetch()` and `async/await`, validating the data in Express, and using parameterized SQL queries to create, read, update, and delete expense records.

## Security and delivery notes

- Keep `.env` private because it contains database credentials.
- Make sure `.gitignore` includes at least:

  ```gitignore
  node_modules/
  .env
  ```

- Do not include `node_modules/` or `.env` in the final ZIP.
- The frontend and backend must both be running locally for the application to work.
