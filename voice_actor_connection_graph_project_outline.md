# Voice Actor Connection Graph – Brief Project Doc

## 1. What This Project Is

This is a **static, interactive visualization website** that shows connections between well-known **voice actors** and the **shows, films, games, or anime** they have worked on together.

The purpose is discovery, not completeness: users should be able to *see* how familiar media properties are connected through shared voice talent.

The site is hosted on **GitHub Pages** and runs entirely in the browser using pre-generated JSON data.

---

## 2. Core Concept

- Voice actors and works are represented as **nodes**
- Shared appearances are represented as **edges**
- Dense overlaps create visually interesting clusters

One dataset supports multiple visual interpretations.

---

## 3. Visualization Methods

### 3.1 Force-Directed Graph (Primary)

The main display uses a **force-directed layout**, where:
- Nodes repel each other
- Links pull related nodes together
- The graph naturally forms clusters around highly connected actors

This works especially well for showing overlap and hubs.

Libraries suitable for this:
- **D3.js** (maximum control, more configuration)
- **vis-network** (faster to get attractive results)

---

### 3.2 Dual View Modes

**Galaxy View**
- Entire dataset visible
- Free pan and zoom
- Best for exploration and discovery

**Focus View**
- One actor centered
- Only directly connected works and co-actors shown
- Lower visual noise, higher readability

Both modes use the same data; only layout rules and filtering change.

---

### 3.3 Interaction Techniques

- Hover: highlight immediate connections
- Click actor: enter Focus View
- Toggle: switch between Galaxy and Focus views
- Optional filters: medium (game, anime, TV)

The goal is minimal UI with intuitive exploration.

---

## 4. Data Format (Static JSON)

The visualization consumes a single JSON file containing:
- **Nodes**: actors and works
- **Links**: voice acting relationships

Example structure:

```json
{
  "nodes": [
    { "id": "troy_baker", "label": "Troy Baker", "type": "actor" },
    { "id": "the_last_of_us", "label": "The Last of Us", "type": "work", "medium": "game" }
  ],
  "links": [
    { "source": "troy_baker", "target": "the_last_of_us" }
  ]
}
```

This file is loaded directly by the frontend.

---

## 5. Data Acquisition (Automated, Offline)

Data is generated **ahead of time**, not at runtime.

Recommended approach:
- Use **Wikidata SPARQL** to fetch voice actor → work relationships
- Rank actors by number of shared works
- Select a fixed number (e.g., top 10)
- Filter out works with fewer than two relevant actors
- Export the cleaned result as static JSON

Automation is used only to **build** the dataset. The website itself remains static.

---

## 6. Git & GitHub Pages Implementation

### 6.1 Repository Structure

```
/
 ├─ index.html
 ├─ styles.css
 ├─ script.js
 ├─ /data
 │   └─ voice_graph.json
 └─ README.md
```

---

### 6.2 Hosting Steps

1. Create a GitHub repository
2. Commit static site files
3. Go to **Settings → Pages**
4. Deploy from `main` branch, root folder
5. GitHub Pages serves the site automatically

The site becomes available at:
```
https://<username>.github.io/<repo-name>/
```

---

### 6.3 Updating the Dataset

When expanding or refreshing data:
1. Run the extraction script locally
2. Generate a new JSON file
3. Commit and push changes
4. GitHub Pages redeploys automatically

No backend changes required.

---

## 7. Why This Approach Works

- Static hosting keeps complexity low
- Automated data generation allows scaling
- Force-directed graphs highlight shared creative networks naturally
- The project can grow without architectural rewrites

This setup prioritizes clarity, visual density, and long-term maintainability.