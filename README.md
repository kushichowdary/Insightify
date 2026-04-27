# Sentilytics - E-Commerce Sentiment Analyzer

Sentilytics is a comprehensive sentiment analysis dashboard built for the Indian E-commerce market. It allows you to analyze product URLs, upload custom review datasets, perform competitive analysis, and access global search intelligence powered by Google Gemini.

## Features

- **Dashboard**: High-level sentiment velocity, platform trends, and analytics summary.
- **URL Analysis**: Analyze product sentiment directly from supported e-commerce URLs.
- **File Upload**: Process bulk review datasets (CSV/JSON/TXT) for detailed sentiment breakdowns.
- **Competitive Analysis**: Compare the sentiment and critical feedback between two competing products.
- **Global Search**: Search and synthesize real-time intelligence about a product.
- **Settings**: Customizable theme (Light/Dark) and accent colors.

## Tech Stack

- **Frontend Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS (via CDN configuration in HTML)
- **Charts**: Recharts
- **Animations**: GSAP, Framer Motion
- **Backend / Authentication**: Firebase (Firestore, Auth)
- **AI Integration**: Google Gemini SDK (`@google/genai`)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase Account
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sentilytics.git
   cd sentilytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If you run this through Google AI Studio / Firebase App Hosting, environment variables might be injected automatically.*

4. **Firebase Configuration**
   Ensure your Firebase configuration is properly populated in `firebase-applet-config.json` if using the Firebase toolchain, or handle initialization within `firebase.ts`.

### Running Locally

```bash
npm run dev
```
This will start a Vite development server, usually accessible at `http://localhost:3000` or `http://localhost:5173`.

### Building for Production

```bash
npm run build
```
This will compile the TypeScript code and bundle the React app into the `dist` folder, ready for deployment to any static hosting provider.

## Modifying and Extending

- `pages/`: Contains all the main router views.
- `components/`: Contains all reusable UI components.
- `services/`: API communication, AI prompt definitions (`geminiService.ts`), and external services.
- `contexts/`: React context providers for themes, authentication, and global data logic.
