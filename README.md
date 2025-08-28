# FIT5032 — WellMan Connect

Vue 3 + Vite application for Assignment 1 (Requirements A & B). Responsive UI via Bootstrap, routing with Vue Router, state via Pinia. Includes signup form validations and dynamic data persisted to LocalStorage.

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Where features live
- Responsiveness (A.2): Bootstrap layout in `src/App.vue` and views
- Validations (B.1): `src/views/SignUpView.vue` (email format + password length + required fields)
- Dynamic Data (B.2): `src/views/ResourcesView.vue` and `src/views/ToolsView.vue` using LocalStorage

## Tech
- Vue 3, Vite
- Bootstrap 5
- Vue Router, Pinia
