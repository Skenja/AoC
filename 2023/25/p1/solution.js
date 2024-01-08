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

const kargers = (vertices) => {
    const graph = new Map(JSON.parse(JSON.stringify([...vertices])));
    let verticesIndex = [...graph.keys()];

    while (graph.size > 2) {
        const vertex1 = verticesIndex[Math.floor(Math.random() * verticesIndex.length)];
        const connectedVertices1 = graph.get(vertex1);
        const vertex2 = connectedVertices1[Math.floor(Math.random() * connectedVertices1.length)];
        const connectedVertices2 = graph.get(vertex2);

        const filteredConnectedVertices2 = connectedVertices2.filter(x => x !== vertex1);

        connectedVertices1.splice(connectedVertices1.indexOf(vertex2), 1, ...filteredConnectedVertices2);
        graph.set(vertex1, [...new Set(connectedVertices1)])

        for (const connectedVertex of filteredConnectedVertices2) {
            const connectedVertices = graph.get(connectedVertex);
            connectedVertices.splice(connectedVertices.indexOf(vertex2), 1, vertex1);
            graph.set(connectedVertex, [...new Set(connectedVertices)])
        }

        graph.delete(vertex2);
        verticesIndex = [...graph.keys()];
    }

    return [...graph].map(x => x[0]);
}

const buildHistogram = (vertices) => {
    const histogram = new Map();

    const n = Math.ceil(vertices.size * 0.5 * Math.log(vertices.size));

    for (let i = 0; i < n; i++) {
        if (i % 100 === 0) console.log(i, '/', n)

        const last2 = kargers(vertices);
        const key = last2.sort().join('-');

        if (!histogram.has(key)) {
            histogram.set(key, 0);
        }

        histogram.set(key, histogram.get(key) + 1);
    }

    return [...histogram.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
}

const walkGraph = (vertices, start) => {
    const visited = new Set();
    const queue = [start];

    while (queue.length > 0) {
        const vertex = queue.shift();

        if (visited.has(vertex)) {
            continue;
        }

        visited.add(vertex);

        for (const connectedVertex of vertices.get(vertex)) {
            queue.push(connectedVertex);
        }
    }

    return visited.size;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const vertices = getVertices(fileContent);
    const top3 = buildHistogram(vertices);

    console.log(top3)

    const top3Edges = top3.map(x => x[0].split('-'));

    for (const [vertex1, vertex2] of top3Edges) {
        const connectedVertices1 = vertices.get(vertex1);
        connectedVertices1.splice(connectedVertices1.indexOf(vertex2), 1);

        const connectedVertices2 = vertices.get(vertex2);
        connectedVertices2.splice(connectedVertices2.indexOf(vertex1), 1);
    }

    const size1 = walkGraph(vertices, top3Edges[0][0]);
    const size2 = walkGraph(vertices, top3Edges[0][1]);

    return [size1, size2, size1 * size2];
}

const solution = await solve('testCase');
console.log(solution);