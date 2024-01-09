import * as fs from 'fs/promises';

const regex = /\b([a-z]+?):?\b/g;

const getGraph = (fileContent) => {
    const vertices = fileContent
        .split('\r\n')
        .map(line => [...line.matchAll(regex)])
        .map(matches => matches.map(match => match[1]))
        .map(([vertex, ...connectedVertices]) => ([vertex, connectedVertices]));

    const graph = [];
    const verticesIndexSet = new Set();

    for (const [source, targets] of vertices) {
        verticesIndexSet.add(source);

        for (const target of targets) {
            verticesIndexSet.add(target);

            const edge = [source, target].sort();
            graph.push(edge);
        }
    }

    const verticesIndex = [...verticesIndexSet];

    return [graph, verticesIndex];
}

const getRandomNodePair = (verticesIndex) => {
    let nodes = [0, 0];

    while (nodes[0] === nodes[1]) {
        nodes = [
            verticesIndex[Math.floor(verticesIndex.length * Math.random())],
            verticesIndex[Math.floor(verticesIndex.length * Math.random())]
        ];
    }

    return nodes;
};

const getShortestPath = (graph, start, end) => {
    const visited = new Map([
        [start, [start]]
    ]);
    const queue = [start];

    while (queue.length > 0) {
        const vertex = queue.shift();
        const connectedVertices = graph
            .filter(edge => edge.includes(vertex))
            .map(edge => edge.filter(node => node !== vertex)[0]);

        for (const connectedVertex of connectedVertices) {
            if (visited.has(connectedVertex)) {
                continue;
            }

            const path = [...visited.get(vertex), connectedVertex];

            if (connectedVertex === end) {
                return [path, null];
            }

            queue.push(connectedVertex);
            visited.set(connectedVertex, path);
        }
    }

    // If no path found, return cut size
    return [null, visited.size];
}

const buildHistogram = (graph, verticesIndex) => {
    const histogram = new Map();

    for (let run = 0; run < 3; run++) {
        const randomNodePair = getRandomNodePair(verticesIndex);
        const [path, _] = getShortestPath(graph, ...randomNodePair)

        while (path.length > 1) {
            const edgeKey = path
                .splice(0, 2, path[1])
                .sort()
                .toString();

            if (!histogram.has(edgeKey)) {
                histogram.set(edgeKey, 0);
            }

            histogram.set(edgeKey, histogram.get(edgeKey) + 1);
        }
    }

    return [...histogram.entries()]
        .sort((a, b) => b[1] - a[1])
    [0][0];
}

const calculateCutSize = (graph, verticesIndex) => {
    while (true) {
        const maxEdge = buildHistogram(graph, verticesIndex);

        const edgeIndex = graph.findIndex(edge => edge.toString() === maxEdge);
        graph.splice(edgeIndex, 1);

        const [_, cutSize] = getShortestPath(graph, ...maxEdge.split(','));

        if (cutSize) {
            return cutSize * (verticesIndex.length - cutSize);
        }
    }
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const [graph, verticesIndex] = getGraph(fileContent);
    const cutSize = calculateCutSize(graph, verticesIndex);

    return cutSize;
}

const solution = await solve('testCase');
console.log(solution);