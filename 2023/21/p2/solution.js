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
    const mapY = map.length;
    const mapX = map[0].length;

    const neighborOptions = [
        [y - 1, x],
        [y + 1, x],
        [y, x - 1],
        [y, x + 1]
    ];

    const neighbors = neighborOptions
        .filter(([y, x]) => map[(y % mapY + mapY) % mapY][(x % mapX + mapX) % mapX] !== '#');

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

const calculateCoeficients = (points) => points.map(step => {
    while (step.some(v => v !== 0)) {
        step = step.map((v, i) => v - step[i - 1]).slice(1);
        points.push(step);
    }

    return points.map(v => v[0]);
})

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const map = fileContent
        .split('\r\n')
        .map((line) => line.split(''));
    const startPosition = findS(map);

    const steps = startPosition[0];
    const mapSize = map.length;

    const s1 = getNumberOfReachablePlots(map, startPosition, steps)
    const s2 = getNumberOfReachablePlots(map, startPosition, steps + mapSize)
    const s3 = getNumberOfReachablePlots(map, startPosition, steps + 2 * mapSize)

    const points = [s1, s2, s3];
    const [c, b, a] = calculateCoeficients([points])[0];
    const x = 202300;
    const solution = a * x * (x - 1) / 2 + b * x + c;

    return solution;
}

const solution = await solve('testCase');
console.log(solution);