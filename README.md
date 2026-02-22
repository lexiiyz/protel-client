# Protel Client (Frontend Web App)

This repository contains the React / Vite frontend application for the Protel Automated APD (Personal Protective Equipment) and Liveness Verification System.

It serves as the main dashboard for security personnel or admin users to manage workers and view real-time detection logs. It also provides the active scanner user interface for real-time Face Recognition, Liveness (Blink Detection), and PPE compliance checks.

## Architecture & Technology Stack

- **Framework**: React 18, built with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & `shadcn/ui` components
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Key Features

- **Dashboard Overview**: Displays total detected violations, compliance rates, and recent worker scans.
- **Attendance Scanner (`/absensi`)**: Connects to the device camera directly. Guides workers through:
  1. _Liveness Challenge_: Prompts the worker to blink 3 times using Text-to-Speech (TTS).
  2. _Face Recognition_: Identifies the worker.
  3. _PPE Check_: Sequentially asks for Helmet, Vest, Gloves, and Boots.
- **Worker Management (`/pekerja`)**: Dashboard to create, read, update, and delete worker profiles, including taking base64 reference photos for face recognition matching.
- **Role Management (`/jabatan`)**: Configure job titles.
- **CCTV Live View (`/camera`)**: Subscribes to backend WebSocket streams to display real-time RTSP camera feeds that are constantly running AI detection.
- **Violations Log (`/pelanggaran`)**: Detailed table and reporting of any captured non-compliant records.

## Prerequisites

- Node.js LTS (v18+)
- Backend Node Express Server running (typically on `http://localhost:5005`)
- A Python `uvicorn` instance running the computer vision microservice (typically deployed on a cloud/VPS).

## Running Locally

1. Install Dependencies:
   ```bash
   npm install
   ```
2. Start the Development Server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Configuration

The `vite.config.ts` handles proxying requests containing `/api` to the backend Express server running on port `5005` to avoid CORS issues during active development.
