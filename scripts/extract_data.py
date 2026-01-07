import requests
import json
import time

WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"

def fetch_voice_actor_data():
    """
    Fetches voice actor connections from Wikidata.
    Uses hardcoded seed actors to build a high-quality initial graph.
    """
    target_qids = [
        "Q1147551", "Q6790967", "Q1319435", "Q6539745", "Q4029", 
        "Q3483664", "Q952156", "Q13938", "Q1147104", "Q1321453"
    ]
    
    values_clause = " ".join([f"wd:{qid}" for qid in target_qids])
    
    query = f"""
    SELECT DISTINCT ?actor ?actorLabel ?work ?workLabel ?mediumLabel WHERE {{
      VALUES ?target_actor {{ {values_clause} }}
      ?work (wdt:P725|wdt:P161) ?target_actor.
      ?work (wdt:P725|wdt:P161) ?actor.
      
      # Filter for common mediums to reduce noise
      ?work wdt:P31 ?medium.
      VALUES ?medium {{ wd:Q11424 wd:Q7075 wd:Q182728 wd:Q482994 wd:Q5398426 }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,ja". }}
    }}
    """
    
    headers = {
        "User-Agent": "VoiceActorConnectionGraph/1.0 (https://github.com/example/actor-graph)",
        "Accept": "application/sparql-results+json"
    }
    
    print("Fetching data from Wikidata...")
    response = requests.get(WIKIDATA_SPARQL_URL, params={"query": query}, headers=headers)
    response.raise_for_status()
    data = response.json()
    
    return data["results"]["bindings"]

def process_data(results):
    nodes = {}
    links = []
    
    # Track work membership to calculate connection strength later
    work_to_actors = {}
    actor_id_to_label = {}
    work_id_to_label = {}
    work_id_to_medium = {}

    for item in results:
        actor_uri = item["actor"]["value"]
        actor_id = actor_uri.split("/")[-1]
        actor_label = item["actorLabel"]["value"]
        
        work_uri = item["work"]["value"]
        work_id = work_uri.split("/")[-1]
        work_label = item["workLabel"]["value"]
        
        medium = item.get("mediumLabel", {}).get("value", "Unknown")
        
        actor_id_to_label[actor_id] = actor_label
        work_id_to_label[work_id] = work_label
        work_id_to_medium[work_id] = medium
        
        if work_id not in work_to_actors:
            work_to_actors[work_id] = set()
        work_to_actors[work_id].add(actor_id)

    # Build Actor Nodes
    for actor_id, label in actor_id_to_label.items():
        nodes[actor_id] = {
            "id": actor_id,
            "label": label,
            "type": "actor",
            "val": 5 # Base size
        }
        
    # Build Work Nodes
    for work_id, label in work_id_to_label.items():
        # Only include works with at least 2 actors from our set
        if len(work_to_actors[work_id]) >= 2:
            nodes[work_id] = {
                "id": work_id,
                "label": label,
                "type": "work",
                "medium": work_id_to_medium[work_id],
                "val": 3 # Base size
            }
            # Create links
            for actor_id in work_to_actors[work_id]:
                links.append({
                    "source": actor_id,
                    "target": work_id
                })

    # Clean up actors who no longer have works (if any were filtered out)
    final_actor_ids = set()
    for link in links:
        if nodes[link["source"]]["type"] == "actor":
            final_actor_ids.add(link["source"])
        if nodes[link["target"]]["type"] == "actor":
            final_actor_ids.add(link["target"])
            
    final_nodes = [node for node_id, node in nodes.items() if node_id in final_actor_ids or node["type"] == "work"]

    return {
        "nodes": final_nodes,
        "links": links
    }

if __name__ == "__main__":
    try:
        raw_results = fetch_voice_actor_data()
        print(f"Raw results from Wikidata: {len(raw_results)}")
        graph_data = process_data(raw_results)
        
        with open("data/voice_graph.json", "w", encoding="utf-8") as f:
            json.dump(graph_data, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully generated graph with {len(graph_data['nodes'])} nodes and {len(graph_data['links'])} links.")
    except Exception as e:
        print(f"Error: {e}")
