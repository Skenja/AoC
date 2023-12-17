import * as fs from 'fs/promises';

const getVertexIdentifier = (x, y) => (x + 1) * 1000 + (y + 1);

const getVertexCoordinates = (vertexIdentifier) => {
    const x = Math.floor(vertexIdentifier / 1000) - 1;
    const y = (vertexIdentifier % 1000) - 1;

    return [x, y];
};

const checkForStraightLine = (prev, last, current) => {
    const prev1 = last;

    if (prev1) {
        const prev2 = prev[prev1[1]][prev1[0]];

        if (prev2) {
            const prev3 = prev[prev2[1]][prev2[0]];

            if (prev3) {
                const prev4 = prev[prev3[1]][prev3[0]];

                if (prev4) {
                    const [x, y] = current;
                    const [x1, y1] = prev1;
                    const [x2, y2] = prev2;
                    const [x3, y3] = prev3;
                    const [x4, y4] = prev4;

                    const isVerticalLine = x === x1 && x1 === x2 && x2 === x3 && x3 === x4;
                    const isHorizontalLine = y === y1 && y1 === y2 && y2 === y3 && y3 === y4;

                    if (isVerticalLine || isHorizontalLine) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

const dijkstra = (graph, source) => {
    const distances = Array.from({ length: graph.length }, () => Array.from({ length: graph[0].length }, () => Number.POSITIVE_INFINITY));
    const prev = Array.from({ length: graph.length }, () => Array.from({ length: graph[0].length }, () => null));
    distances[source[1]][source[0]] = 0;
    const processed = [];
    const edges = new Set([getVertexIdentifier(...source)]);

    while (processed.length === 0 || edges.size !== 0) {
        // console.log(distances.map(row => row.join('\t')).join('\n'));
        // pick neighbour with smallest distance
        let picked = null;
        let minDistance = Number.MAX_VALUE;
        for (const edge of edges) {
            const [x, y] = getVertexCoordinates(edge);
            const distance = distances[y][x];

            if (distance < minDistance) {
                picked = [x, y];
                minDistance = distance;
            }
        }

        const pickedIdentifier = getVertexIdentifier(...picked);

        // add picked to processed
        processed.push(pickedIdentifier);

        // remove picked from edges
        edges.delete(pickedIdentifier);

        // get neighbours of picked
        const potentialNeighbours = [
            [picked[0] - 1, picked[1]],
            [picked[0] + 1, picked[1]],
            [picked[0], picked[1] - 1],
            [picked[0], picked[1] + 1],
        ];

        const neighbours = potentialNeighbours
            .filter(([x, y]) => x >= 0 && x < graph[0].length && y >= 0 && y < graph.length)
            .filter(coordinates => !processed.includes(getVertexIdentifier(...coordinates)))
            .filter(coordinates => !checkForStraightLine(prev, picked, coordinates));

        // add neighbours to edges
        for (const neighbour of neighbours) {
            edges.add(getVertexIdentifier(...neighbour));
        }
        // console.log(picked, '\t', neighbours.map(x => '[' + x.join(',') + ']').join(','), '\t', [...edges.values()].join(', '),);

        // update distances for neighbours if not fourth vertex in a straight line
        for (const neighbour of neighbours) {
            const [x, y] = neighbour;
            const distance = distances[picked[1]][picked[0]] + graph[y][x];
            if (distance < distances[y][x]) {
                distances[y][x] = distance;
                prev[y][x] = picked;
            }
        }
    }

    // const visualization = Array.from({ length: graph.length }, (_, y) => Array.from({ length: graph[0].length }, (_, x) => graph[y][x]));
    // let current = [graph[0].length - 1, graph.length - 1];

    // while (current) {
    //     const previous = prev[current[1]][current[0]];

    //     if (!previous) {
    //         break;
    //     }

    //     let char = '*';

    //     if (current[0] === previous[0] && current[1] === previous[1] - 1) {
    //         char = '^';
    //     } else if (current[0] === previous[0] && current[1] === previous[1] + 1) {
    //         char = 'v';
    //     } else if (current[0] === previous[0] - 1 && current[1] === previous[1]) {
    //         char = '<';
    //     } else if (current[0] === previous[0] + 1 && current[1] === previous[1]) {
    //         char = '>';
    //     }

    //     visualization[current[1]][current[0]] = char;
    //     current = previous;
    // }

    // console.log(visualization.map(row => row.join('')).join('\n'));

    return distances;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const cityMap = fileContent.split('\r\n')
        .map((line) => line
            .split('')
            .map(Number));

    const source = [0, 0];
    const target = [cityMap[0].length - 1, cityMap.length - 1];

    const distances = dijkstra(cityMap, source);
    // console.log(cityMap.map(row => row.join('\t')).join('\n'));
    // console.log();
    // console.log(distances.map(row => row.join('\t')).join('\n'));
    return distances[target[1]][target[0]];
}

const solution = await solve('testCase');
console.log(solution);