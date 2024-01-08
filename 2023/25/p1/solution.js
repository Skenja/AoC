import * as fs from 'fs/promises';

const regex = /\b([a-z]+?):?\b/g;

const getVertices = (fileContent) => {
    const input = fileContent
        .split('\r\n')
        .map(line => [...line.matchAll(regex)])
        .map(matches => matches.map(match => match[1]))
        .map(([vertex, ...connectedVertices]) => ([vertex, connectedVertices]));

    const vertices = new Map();

    for (const [vertex, connectedVertices] of input) {
        if (!vertices.has(vertex)) {
            vertices.set(vertex, []);
        }

        for (const connectedVertex of connectedVertices) {
            if (!vertices.has(connectedVertex)) {
                vertices.set(connectedVertex, []);
            }

            vertices.get(vertex).push(connectedVertex);
            vertices.get(connectedVertex).push(vertex);
        }
    }

    return vertices;
}

const findPath = (vertices, start, end) => {
    const queue = [{
        vertex: start,
        visited: new Set(),
        path: []
    }];

    while (queue.length > 0) {
        const { vertex, visited, path } = queue.shift();
        visited.add(vertex);
        path.push(vertex);

        if (vertex === end) {
            return path;
        }

        for (const connectedVertex of vertices.get(vertex)) {
            if (visited.has(connectedVertex)) {
                continue;
            }

            queue.push({
                vertex: connectedVertex,
                visited: new Set(visited),
                path: [...path]
            });
        }
    }
}

const buildHistogram = (vertices) => {
    const verticesArray = [...vertices.keys()];
    const verticesCount = verticesArray.length;
    const exploreCount = 200;
    const histogram = new Map();

    for (let i = 0; i < exploreCount; i++) {
        const startIndex = Math.floor(Math.random() * verticesCount);
        const endIndexOption = Math.floor(Math.random() * verticesCount);
        const endIndex = endIndexOption === startIndex
            ? (endIndexOption + 1) % verticesCount
            : endIndexOption;
        const start = verticesArray[startIndex];
        const end = verticesArray[endIndex];

        const path = findPath(vertices, start, end);

        for (let pathStep = 1; pathStep < path.length; pathStep++) {
            const v1 = path[pathStep - 1];
            const v2 = path[pathStep];
            const vArray = [v1, v2];
            const sortedVArray = vArray.sort();
            const edge = sortedVArray.join('-');

            if (!histogram.has(edge)) {
                histogram.set(edge, 0);
            }

            histogram.set(edge, histogram.get(edge) + 1);
        }
    }

    const top3 = [...histogram.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([vertex]) => vertex);

    return top3;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const vertices = getVertices(fileContent);

    const histogramHistogram = new Map();

    for (let i = 0; i < 50; i++) {
        const histogram = buildHistogram(vertices);

        for (const edge of histogram) {
            if (!histogramHistogram.has(edge)) {
                histogramHistogram.set(edge, 0);
            }

            histogramHistogram.set(edge, histogramHistogram.get(edge) + 1);
        }
    }

    const top3 = [...histogramHistogram.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([vertex]) => vertex);

    return top3;
}

const solution = await solve('testCase');
console.log(solution); 