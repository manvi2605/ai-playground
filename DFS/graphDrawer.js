const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const bfsButton = document.getElementById("bfsButton");
const dfsButton = document.getElementById("dfsButton");

const nodes = [];
let edges = [];
let isDragging = false;
let startNode = null;
let radius = 20;

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

function drawQueue(queue) {
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.font = "14px Arial";
    ctx.fillText("Queue:", 10, canvas.height - 70);

    queue.forEach((node, index) => {
        ctx.fillStyle = "lightblue";
        ctx.fillRect(60 + index * 25, canvas.height - 85, 20, 20);
        ctx.fillStyle = "black";
        ctx.fillText(node.label, 65 + index * 25, canvas.height - 70);
    });
}

function displayTraversal(traversal) {
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.font = "14px Arial";
    ctx.fillText(`Traversal Order: ${traversal.join(" -> ")}`, 10, canvas.height - 30);
}

function getNodeAtPosition(x, y) {
    return nodes.find(
        (node) => Math.hypot(node.x - x, node.y - y) <= radius
    );
}

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

canvas.addEventListener("dblclick", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    const clickedNode = getNodeAtPosition(x, y);

    if (clickedNode) {
        startNode = clickedNode;
    }
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

function bfs(startNode) {
    const queue = [startNode];
    const visited = new Set();
    const traversalOrder = [];
    visited.add(startNode);

    function visit() {
        if (queue.length === 0) return;

        const node = queue.shift();
        node.color = "green"; 
        if (!traversalOrder.includes(node.label)) {
            traversalOrder.push(node.label); 
        }
        drawGraph();
        drawQueue(queue);
        displayTraversal(traversalOrder);

        const neighbors = edges
            .filter(edge => edge.startNode === node || edge.endNode === node)
            .map(edge => edge.startNode === node ? edge.endNode : edge.startNode);

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }

        setTimeout(visit, 2000); 
    }

    visit();
}

function drawStack(neighbors) {
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.font = "14px Arial";
    ctx.fillText("Stack:", 10, canvas.height - 100);

    neighbors.forEach((node, index) => {
        ctx.fillStyle = "lightcoral";
        ctx.fillRect(60 + index * 25, canvas.height - 115, 20, 20);
        ctx.fillStyle = "black";
        ctx.fillText(node.label, 65 + index * 25, canvas.height - 100);
    });
}

function dfs(startNode) {
    const stack = [startNode];
    const visited = new Set();
    const traversalOrder = [];

    function visit() {
        if (stack.length === 0) return;

        const node = stack.pop();
        if (!visited.has(node)) {
            visited.add(node);
            node.color = "blue"; 
            traversalOrder.push(node.label); 
            drawGraph();
            displayTraversal(traversalOrder);

            const neighbors = edges
                .filter(edge => edge.startNode === node || edge.endNode === node)
                .map(edge => edge.startNode === node ? edge.endNode : edge.startNode)
                .filter(neighbor => !visited.has(neighbor))
                .reverse(); 

            drawStack(neighbors); 

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    stack.push(neighbor);
                }
            }
        }

        setTimeout(visit, 4000); 
    }

    visit();
}

bfsButton.addEventListener("click", () => {
    if (nodes.length > 0) {
        nodes.forEach(node => {
            node.color = "red";
            node.traversalOrder = undefined;
        });
        drawGraph();
        bfs(nodes[0]);
    }
});

dfsButton.addEventListener("click", () => {
    if (nodes.length > 0) {
        nodes.forEach(node => {
            node.color = "red";
            node.traversalOrder = undefined;
        });
        drawGraph();
        dfs(nodes[0]);
    }
});
