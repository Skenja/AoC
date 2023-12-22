import * as fs from 'fs/promises';

const findS = (map) => {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (map[y][x] === 'S') {
                return [y, x];
            }
        }
    }
}

const getNeighbors = (y, x, map) => {
    const neighborOptions = [];

    if (y > 0) {
        neighborOptions.push([y - 1, x]);
    }

    if (y < map.length - 1) {
        neighborOptions.push([y + 1, x]);
    }

    if (x > 0) {
        neighborOptions.push([y, x - 1]);
    }

    if (x < map[0].length - 1) {
        neighborOptions.push([y, x + 1]);
    }

    const neighbors = neighborOptions.filter(([y, x]) => map[y][x] !== '#');

    return neighbors;
};

const getNumberOfReachablePlots = (map, start, numberOfSteps) => {
    let positions = new Set();
    positions.add(JSON.stringify(start));

    for (let i = 0; i < numberOfSteps; i++) {
        const newPositions = new Set();

        for (const position of positions) {
            const [y, x] = JSON.parse(position);
            const neighbors = getNeighbors(y, x, map);

            for (const neighbor of neighbors) {
                newPositions.add(JSON.stringify(neighbor));
            }
        }

        positions = newPositions;
    }

    return positions.size;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const map = fileContent
        .split('\r\n')
        .map((line) => line.split(''));
    const startPosition = findS(map);
    const distances = getNumberOfReachablePlots(map, startPosition, 64)

    return distances
}

const solution = await solve('testCase');
console.log(solution); 