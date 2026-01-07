# Voice Actor Connection Graph

An interactive, high-performance visualization of voice actors and their shared works, built with React, Canvas, and Wikidata.

## Features
- **Interconnected Graph**: Nodes repel and edges pull, forming natural clusters around prolific hubs.
- **Dynamic Data**: Fetched weekly from Wikidata using a Python ETL pipeline.
- **Focus Mode**: Click any node to filter for 1st-degree connections and reduce noise.
- **Premium UI**: Glassmorphic dark-mode design with smooth animations.

## Tech Stack
- **Frontend**: React (No-build ESM), `react-force-graph-2d` (Canvas rendering).
- **Data**: Python, Wikidata SPARQL.
- **Hosting**: AWS S3 + CloudFront (Static Website).
- **CI/CD**: GitHub Actions.

## Setup & Deployment

### 1. Data Refresh
To manually refresh the data, run:
```bash
python3 scripts/extract_data.py
```
This will update `data/voice_graph.json`.

### 2. Local Development
Start a simple local server:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

### 3. AWS Configuration
To enable automatic deployment via GitHub Actions, add the following secrets to your repository:
- `AWS_S3_BUCKET`: Your bucket name.
- `AWS_ACCESS_KEY_ID`: AWS IAM user key.
- `AWS_SECRET_ACCESS_KEY`: AWS IAM user secret.
- `CLOUDFRONT_DISTRIBUTION_ID`: Your CloudFront distribution ID.

## Architecture
The project uses a **No-Build** approach for the frontend. React and dependencies are loaded via `esm.sh` import maps. This keeps the repository clean and ensures it works immediately on any static host (GitHub Pages, S3, Netlify) without a compilation step.
