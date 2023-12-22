import * as fs from 'fs/promises';

const checkIfRockOrReachable = (coordinates, map, reachable) => {
    const [y, x] = coordinates;

    return map[y][x] === '#' || reachable[y][x];
}

const getNeighbors = (y, x, map, reachable) => {
    const neighbors = [];

    if (y > 0) {
        const neighbor = [y - 1, x];

        if (!checkIfRockOrReachable(neighbor, map, reachable)) {
            neighbors.push(neighbor);
        }
    }

    if (y < map.length - 1) {
        const neighbor = [y + 1, x];

        if (!checkIfRockOrReachable(neighbor, map, reachable)) {
            neighbors.push(neighbor);
        }
    }

    if (x > 0) {
        const neighbor = [y, x - 1];

        if (!checkIfRockOrReachable(neighbor, map, reachable)) {
            neighbors.push(neighbor);
        }
    }

    if (x < map[0].length - 1) {
        const neighbor = [y, x + 1];

        if (!checkIfRockOrReachable(neighbor, map, reachable)) {
            neighbors.push(neighbor);
        }
    }

    return neighbors;
};

const getNumberOfReachablePlots = (map, start, numberOfSteps) => {
    const reachable = Array(map.length)
        .fill()
        .map(() => Array(map[0].length).fill(false));
    const distances = Array
        .from({ length: map.length },
            () => Array.from({ length: map[0].length }, () => new Set()));

    distances[start[0]][start[1]].add(0);

    const queue = [start];

    while (queue.length > 0) {
        const [y, x] = queue.shift();
        const currentDistance = Math.max(...distances[y][x]);
        const newDistance = currentDistance + 1;

        if (newDistance > numberOfSteps)
            continue;

        const neighbors = getNeighbors(y, x, map, reachable);

        for (const neighbor of neighbors) {
            const [yN, xN] = neighbor;

            const existingDistances = distances[yN][xN];

            existingDistances.add(newDistance);
            queue.push(neighbor);

            const isBiggerThan1 = newDistance > 1;
            const isDenominator = numberOfSteps % newDistance === 0;
            const isEven = newDistance % 2 === 0;

            if (isBiggerThan1 && isDenominator && isEven) {
                reachable[yN][xN] = true;
            }
        }
    }

    const numberOfReachablePlots = reachable
        .map(row => row.filter(plot => plot).length)
        .reduce((acc, curr) => acc + curr, 0);

    return numberOfReachablePlots;
};

const findS = (map) => {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (map[y][x] === 'S') {
                return [y, x];
            }
        }
    }
}

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