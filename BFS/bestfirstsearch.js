const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const bestFirstButton = document.getElementById("bestFirstButton");
const assignHeuristicButton = document.getElementById("assignHeuristicButton");
const traversalOrderList = document.getElementById("traversalOrder");
const heuristicInputContainer = document.getElementById("heuristicInputContainer");
const startNodeInput = document.getElementById("startNodeInput");
const goalNodeInput = document.getElementById("goalNodeInput");

const nodes = [];
let edges = [];
let isDragging = false;
let startNode = null;
let radius = 20;

// Drawing nodes
function drawNode(node) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "16px Arial";
    ctx.fillText(node.traversalOrder !== undefined ? node.traversalOrder : node.label, node.x, node.y);
}

// Drawing edges
function drawEdge(edge) {
    const { startNode, endNode } = edge;
    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);
    ctx.lineTo(endNode.x, endNode.y);
    ctx.stroke();
    ctx.closePath();
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    edges.forEach(drawEdge);
    nodes.forEach(drawNode);
}

function getNodeAtPosition(x, y) {
    return nodes.find(
        (node) => Math.hypot(node.x - x, node.y - y) <= radius
    );
}

// Event listeners for creating nodes and edges
canvas.addEventListener("mousedown", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    const clickedNode = getNodeAtPosition(x, y);

    if (clickedNode) {
        isDragging = true;
        startNode = clickedNode;
    } else {
        const newNode = {
            x,
            y,
            label: String.fromCharCode(65 + nodes.length),
            color: "red",
        };
        nodes.push(newNode);
        drawGraph();
        updateHeuristicInputs(); // Update heuristic input fields
    }
});

canvas.addEventListener("mouseup", (event) => {
    if (isDragging) {
        const x = event.offsetX;
        const y = event.offsetY;
        const endNode = getNodeAtPosition(x, y);

        if (endNode && startNode !== endNode) {
            edges.push({ startNode, endNode });
            drawGraph();
        }
    }
    isDragging = false;
    startNode = null;
});

canvas.addEventListener("mousemove", (event) => {
    if (isDragging && startNode) {
        drawGraph();
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
        ctx.closePath();
    }
});

// Best-First Search Algorithm
function bestFirstSearch(startNode, goalNode, heuristic) {
    const priorityQueue = [];
    const visited = new Set();
    const traversalOrder = [];

    function getHeuristic(node) {
        return heuristic[node.label] || 0;
    }

    function visit() {
        if (priorityQueue.length === 0) return;

        // Sort priorityQueue by heuristic value
        priorityQueue.sort((a, b) => getHeuristic(a) - getHeuristic(b));
        const node = priorityQueue.shift();

        if (!visited.has(node)) {
            visited.add(node);
            node.color = "orange"; 
            traversalOrder.push(node.label); 
            drawGraph();
            updateTraversalOrder(traversalOrder);

            // Check if the goal node has been reached
            if (node.label === goalNode.label) {
                alert(`Goal Node ${goalNode.label} reached!`);
                return; // Stop the search
            }

            const neighbors = edges
                .filter(edge => edge.startNode === node || edge.endNode === node)
                .map(edge => edge.startNode === node ? edge.endNode : edge.startNode)
                .filter(neighbor => !visited.has(neighbor));

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    priorityQueue.push(neighbor);
                }
            }
        }

        setTimeout(visit, 2000); 
    }

    // Initialize priority queue with start node
    priorityQueue.push(startNode);
    visit();
}

// Example heuristic function for Best-First Search
const heuristic = {};

// Update traversal order on the UI
function updateTraversalOrder(traversalOrder) {
    traversalOrderList.innerHTML = "";
    traversalOrder.forEach((nodeLabel, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}: ${nodeLabel}`;
        traversalOrderList.appendChild(li);
    });
}

// Update heuristic inputs for each node
function updateHeuristicInputs() {
    heuristicInputContainer.innerHTML = "";

    nodes.forEach((node) => {
        const div = document.createElement("div");
        div.classList.add("node-input");

        const label = document.createElement("label");
        label.textContent = `${node.label}: `;
        div.appendChild(label);

        const input = document.createElement("input");
        input.type = "number";
        input.value = heuristic[node.label] || 0;
        input.addEventListener("change", (event) => {
            heuristic[node.label] = parseInt(event.target.value, 10) || 0;
        });
        div.appendChild(input);

        heuristicInputContainer.appendChild(div);
    });
}

bestFirstButton.addEventListener("click", () => {
    const startNodeLabel = startNodeInput.value.toUpperCase();
    const goalNodeLabel = goalNodeInput.value.toUpperCase();

    const startNode = nodes.find(node => node.label === startNodeLabel);
    const goalNode = nodes.find(node => node.label === goalNodeLabel);

    if (!startNode || !goalNode) {
        alert("Please ensure both start and goal nodes are valid.");
        return;
    }

    nodes.forEach(node => {
        node.color = "red";
        node.traversalOrder = undefined;
    });

    drawGraph();
    bestFirstSearch(startNode, goalNode, heuristic);
});
