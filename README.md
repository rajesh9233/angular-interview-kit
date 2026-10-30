# Angular Signals CRUD Starter

A base Angular CRUD application using **standalone components**, **signals**, `HttpClient`, and **json-server** as a mock REST API.

## Requirements

- Node.js 20.11+ (recommended for Angular 19)
- npm

## Run locally

Open two terminals in this folder.

### 1. Install dependencies

```bash
npm install
```

### 2. Start the mock REST API

```bash
npm run api
```

json-server serves:
- `GET/POST /users`
- `GET/PUT/PATCH/DELETE /users/:id`
- `GET/POST /products`
- `GET/PUT/PATCH/DELETE /products/:id`

The API runs at `http://localhost:3000`.

### 3. Start Angular

In the second terminal:

```bash
npm start
```

Open `http://localhost:4200`.

## Features

- Standalone Angular components (no NgModules)
- Signals for current section, records, loading, error and form state
- `computed()` for derived UI state
- CRUD for Users and Products
- Typed API service using `HttpClient`
- Loading and error states
- Responsive layout
- Mock data in `db.json`

## Project structure

```text
src/
  app/
    models/
      user.model.ts
      product.model.ts
    services/
      api.service.ts
    app.component.ts
    app.component.html
    app.component.css
  main.ts
  index.html
  styles.css
db.json
```

## Notes

- Data changes are persisted to `db.json` while json-server is running.
- This is a learning starter, not production authentication or authorization.
- `npm install` is intentionally required after extracting; `node_modules` is not included in the ZIP.
