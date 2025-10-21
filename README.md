# FIT5032 — WellMan Connect

Vue 3 + Vite application for Assignment 1 (Requirements A & B). Responsive UI via Bootstrap, routing with Vue Router, state via Pinia. Includes signup form validations and dynamic data persisted to LocalStorage.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the root directory
# See ENVIRONMENT_SETUP.md for detailed configuration
```

4. Start the development server:
```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

### Environment Variables

See `ENVIRONMENT_SETUP.md` for detailed information about required environment variables including:
- Google Maps API configuration
- Firebase configuration  
- SendGrid email service configuration

## Where features live
- Responsiveness (A.2): Bootstrap layout in `src/App.vue` and views
- Validations (B.1): `src/views/SignUpView.vue` (email format + password length + required fields)
- Dynamic Data (B.2): `src/views/ResourcesView.vue` and `src/views/ToolsView.vue` using LocalStorage

## Tech
- Vue 3, Vite
- Bootstrap 5
- Vue Router, Pinia
