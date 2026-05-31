# CodeTrace - Coding Profile Stacker

> A web dashboard that aggregates and visualizes your complete coding footprint across major competitive programming and development platforms 

It is a built with React 19, TanStack & Tailwind. It aggregates and visualizes statistics across six major competitive programming and development platforms:

- GitHub
- LeetCode
- Codeforces
- GeeksforGeeks (GFG)
- CodeChef
- HackerRank

---

## Features

- **Unified Multi-Platform Dashboard:** Enter usernames for all or a subset of supported platforms to see an aggregated summary at a glance.
- **Platform Deep Dives:** Detailed, standalone stats pages with interactive charts for each platform (e.g., `/github/$username`, `/leetcode/$username`).
- **Universal Activity Heatmap:** Consolidates daily contributions and submission histories from all active platforms into a single interactive calendar.
- **Rating History Charts:** Tracks competitive programming ratings and ranks over time using interactive line charts (`recharts`).
- **Difficulty Breakdowns:** Visualizes problem counts solved by difficulty tier (Easy, Medium, Hard) using custom meters.
- **Language Profiles:** Displays top coding languages utilized by the user on GitHub and other platforms.
- **Stateful URL Sync:** Synchronizes input usernames with search query parameters using `nuqs`, making user profiles easily shareable.

---

## Technology Stack

- **Core:** React 19 + TypeScript + Vite 8
- **Routing:** [TanStack Router](https://tanstack.com/router/latest)
- **State & Fetching:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Styling & Components:** Tailwind CSS v4, [Radix UI](https://www.radix-ui.com/), and [shadcn/ui](https://ui.shadcn.com/)
- **Data Visualizations:** [Recharts](https://recharts.org/) & `react-activity-calendar`
- **Icons:** [Lucide React](https://lucide.dev/) & [Simple Icons](https://simpleicons.org/)

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd stats-api-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the Vite development server locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Build and Preview

Compile the production-ready code:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## Integrating Backend APIs

This frontend integrates with six independent backend Stat APIs. By default, it communicates with hosted API endpoints (e.g., `https://github-stats.tashif.codes`). 

### Running and Pointing to Local Backends

If you are running the backend microservices locally (typically hosted in a sister directory like `../Stat APIs/`), you can point Profile Stacker to your local services:

1. Follow the local setup instructions in [RUNNING.md](file:///Users/taf/Projects/stats-api-demo/RUNNING.md) to launch the backend services.
2. Create a `.env.local` file in the root of this project:
   ```dotenv
   # .env.local — point the unified /card endpoints at local backends
   VITE_GITHUB_API=http://localhost:8001
   VITE_LEETCODE_API=http://localhost:8002
   VITE_CODEFORCES_API=http://localhost:8003
   VITE_GFG_API=http://localhost:8004
   VITE_CODECHEF_API=http://localhost:8005
   VITE_HACKERRANK_API=http://localhost:8006
   ```
3. Restart the development server. Vite will automatically load these environment overrides.

For more details on microservice setup, default ports, env configs, and CORS troubleshooting, refer to [RUNNING.md](file:///Users/taf/Projects/stats-api-demo/RUNNING.md).

---

## Project Structure

```text
├── src/
│   ├── api/            # API client calls (e.g., cards.ts for unified endpoints)
│   ├── assets/         # Static assets (images, logos)
│   ├── components/     # Reusable UI widgets (cards, heatmaps, rating charts)
│   │   └── ui/         # Base Shadcn/Radix components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Individual and dashboard views (e.g. ProfilePage, GFGPage)
│   ├── types/          # TypeScript interface definitions (e.g., unified.ts)
│   ├── index.css       # Core Tailwind CSS configuration & design tokens
│   ├── main.tsx        # React application entrypoint
│   └── router.tsx      # TanStack routing configuration
├── index.html          # HTML entry file & metadata
├── package.json        # Project manifest & npm scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration & dev server proxy settings
```

---

## License

This project is open-source and licensed under the [MIT License](file:///Users/taf/Projects/stats-api-demo/LICENSE).
