// Main application logic using global variables for maximum compatibility (No-Build setup)
const { useState, useEffect, useRef, useMemo } = window.React;
const ForceGraph2D = window.ForceGraph2D;

const e = window.React.createElement;

const App = () => {
    const [data, setData] = useState({ nodes: [], links: [] });
    const [filter, setFilter] = useState('all');
    const [selectedNode, setSelectedNode] = useState(null);
    const [focusNode, setFocusNode] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());

    const fgRef = useRef();

    useEffect(() => {
        fetch('data/voice_graph.json')
            .then(res => res.json())
            .then(json => {
                setData(json);
            })
            .catch(err => console.error("Failed to load graph data:", err));
    }, []);

    const filteredData = useMemo(() => {
        let nodes = data.nodes || [];
        let links = data.links || [];

        if (filter !== 'all') {
            const validWorks = new Set(nodes.filter(n => n.type === 'work' && n.medium === filter).map(n => n.id));
            links = links.filter(l => validWorks.has(l.target.id || l.target));
            const connectedActors = new Set(links.map(l => l.source.id || l.source));
            nodes = nodes.filter(n => (n.type === 'work' && validWorks.has(n.id)) || (n.type === 'actor' && connectedActors.has(n.id)));
        }

        if (focusNode) {
            const neighbors = new Set([focusNode.id]);
            // Find all works the focusNode (actor) is in
            const activeLinks = links.filter(l => (l.source.id || l.source) === focusNode.id || (l.target.id || l.target) === focusNode.id);
            const workIds = new Set(activeLinks.map(l => l.source.id === focusNode.id ? (l.target.id || l.target) : (l.source.id || l.source)));

            workIds.forEach(id => neighbors.add(id));

            // Find all actors in those works
            const secondaryLinks = data.links.filter(l => workIds.has(l.target.id || l.target) || workIds.has(l.source.id || l.source));
            secondaryLinks.forEach(l => {
                neighbors.add(l.source.id || l.source);
                neighbors.add(l.target.id || l.target);
            });

            links = secondaryLinks;
            nodes = data.nodes.filter(n => neighbors.has(n.id));
        }

        return { nodes, links };
    }, [data, filter, focusNode]);

    useEffect(() => {
        if (fgRef.current) {
            // Give the simulation a moment to stabilize before zooming
            setTimeout(() => {
                fgRef.current.zoomToFit(1000, 100);
            }, 500);
        }
    }, [focusNode, filter]);

    const handleNodeHover = node => {
        highlightNodes.clear();
        highlightLinks.clear();
        if (node) {
            highlightNodes.add(node);
            (data.links || []).forEach(link => {
                if ((link.source.id || link.source) === node.id || (link.target.id || link.target) === node.id) {
                    highlightLinks.add(link);
                    highlightNodes.add(link.source);
                    highlightNodes.add(link.target);
                }
            });
        }
    };

    const handleNodeClick = node => {
        setSelectedNode(node);
        const panel = document.getElementById('info-panel');
        const name = document.getElementById('node-name');
        const type = document.getElementById('node-type');
        const details = document.getElementById('node-details');
        const focusBtn = document.getElementById('focus-btn');

        if (!panel) return;

        name.innerText = node.label;
        type.innerText = node.type === 'actor' ? 'Voice Actor' : node.medium || 'Work';

        if (node.type === 'actor') {
            const works = (data.links || []).filter(l => (l.source.id || l.source) === node.id)
                .map(l => data.nodes.find(n => n.id === (l.target.id || l.target))?.label)
                .filter(Boolean);
            details.innerHTML = `<strong>Credits:</strong><br>${[...new Set(works)].slice(0, 15).join(', ')}${works.length > 15 ? '...' : ''}`;
        } else {
            const actors = (data.links || []).filter(l => (l.target.id || l.target) === node.id)
                .map(l => data.nodes.find(n => n.id === (l.source.id || l.source))?.label)
                .filter(Boolean);
            details.innerHTML = `<strong>Cast:</strong><br>${actors.join(', ')}`;
        }

        focusBtn.innerText = focusNode ? 'Exit Focus View' : 'Focus View';
        panel.classList.remove('hidden');

        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(2, 1000);
        }
    };

    useEffect(() => {
        const searchInput = document.getElementById('search-input');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const closePanel = document.getElementById('close-panel');
        const focusBtn = document.getElementById('focus-btn');

        if (!searchInput) return;

        const onSearch = (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) return;
            const match = (data.nodes || []).find(n => n.label.toLowerCase().includes(query));
            if (match && fgRef.current) {
                fgRef.current.centerAt(match.x, match.y, 1000);
                fgRef.current.zoom(3, 1000);
                setSelectedNode(match);
                handleNodeClick(match);
            }
        };

        const onFilter = (e) => {
            const m = e.target.getAttribute('data-medium');
            setFilter(m);
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        };

        const onFocus = () => {
            if (focusNode) {
                setFocusNode(null);
                focusBtn.innerText = 'Focus View';
            } else if (selectedNode) {
                setFocusNode(selectedNode);
                focusBtn.innerText = 'Exit Focus View';
            }
        };

        searchInput.addEventListener('input', onSearch);
        filterBtns.forEach(b => b.addEventListener('click', onFilter));
        closePanel.addEventListener('click', () => document.getElementById('info-panel').classList.add('hidden'));
        focusBtn.addEventListener('click', onFocus);

        return () => {
            searchInput.removeEventListener('input', onSearch);
            filterBtns.forEach(b => b.removeEventListener('click', onFilter));
            focusBtn.removeEventListener('click', onFocus);
        };
    }, [data, selectedNode, focusNode]);

    return e(ForceGraph2D, {
        ref: fgRef,
        graphData: filteredData,
        backgroundColor: "#0b0e14",
        nodeRelSize: 6,
        nodeVal: d => d.val,
        nodeLabel: d => d.label,
        nodeColor: d => d.type === 'actor' ? '#00d2ff' : '#ff007a',
        nodeCanvasObject: (node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Outfit`;

            const color = node.type === 'actor' ? '#00d2ff' : '#ff007a';
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val || 5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (globalScale > 1.5) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, node.x, node.y + (node.val || 5) + 5);
            }
        },
        linkWidth: link => highlightLinks.has(link) ? 2 : 1,
        linkColor: () => 'rgba(255, 255, 255, 0.1)',
        linkDirectionalParticles: link => highlightLinks.has(link) ? 4 : 0,
        linkDirectionalParticleWidth: 2,
        onNodeHover: handleNodeHover,
        onNodeClick: handleNodeClick,
        d3AlphaDecay: 0.02,
        d3VelocityDecay: 0.3
    });
};

const root = window.ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
