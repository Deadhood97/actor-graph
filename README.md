# Voice Actor Connection Graph

An interactive, high-performance visualization of the interconnected world of voice acting. Explore how your favorite actors are linked through the games, anime, and films they've worked on together.

## 🚀 Features

- **Interactive Force-Directed Graph**: Smooth, high-performance rendering (Canvas/WebGL).
- **Galaxy vs. Focus View**: Zoom out to see the entire network or focus on a single actor and their 2nd-degree connections (co-actors).
- **Smart Filtering**: Filter connections by medium (Video Games, Anime, Film).
- **Search & Discovery**: Quickly find specific actors or works.
- **Dynamic Data**: Powered by a Python ETL pipeline fetching the latest data from Wikidata SPARQL.

## 🛠️ Technology Stack

- **Frontend**: React (No-Build/ESM), `react-force-graph-2d`.
- **Aesthetics**: Premium Dark Mode, Glassmorphism, Google Fonts (Outfit).
- **Data Engine**: Python 3, Wikidata SPARQL API.
- **Hosting**: GitHub Pages (Static).

## 📂 Project Structure

- `/scripts`: Python extraction and data processing scripts.
- `/data`: Contains `voice_graph.json` (the generated graph data).
- `index.html`: Main entry point.
- `app.js`: React application logic (UMD).
- `styles.css`: Custom premium styles.

## 🛠️ Setup & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Deadhood97/actor-graph.git
   cd actor-graph
   ```

2. **Serve the application**:
   Since it's a static site, you can use any local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`.

3. **Refresh Data (Optional)**:
   Ensure you have `requests` installed:
   ```bash
   pip install requests
   python scripts/extract_data.py
   ```

## 🌐 Deployment

The project is hosted on **GitHub Pages**.

To deploy your own copy:
1. Go to your repository **Settings > Pages**.
2. Set **Source** to "Deploy from a branch".
3. Select the `main` branch and the root (`/`) folder.
4. Your site will be live at `https://<your-username>.github.io/actor-graph/`.

---
*Built with ❤️ for the Voice Acting community.*