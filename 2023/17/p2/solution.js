import * as fs from 'fs/promises';
import FlatQueue from 'flatqueue';

const deltaX = new Map([
    ['up', 0],
    ['down', 0],
    ['left', -1],
    ['right', 1],
]);

const deltaY = new Map([
    ['up', -1],
    ['down', 1],
    ['left', 0],
    ['right', 0],
]);

const getMover = (cityMap, minSteps, maxSteps, queue, visited) => {
    return (x, y, direction, heat, directionMoves) => {
        const dx = deltaX.get(direction);
        const dy = deltaY.get(direction);

        for (let i = 1; i <= maxSteps; i++) {
            const newX = x + dx * i;
            const newY = y + dy * i;
            const newDirectionMoves = directionMoves + i;

            const isXOutOfBounds = newX < 0 || newX >= cityMap[0].length;
            const isYOutOfBounds = newY < 0 || newY >= cityMap.length;

            if (isXOutOfBounds || isYOutOfBounds || newDirectionMoves > maxSteps) {
                return;
            }

            heat += cityMap[newY][newX];

            if (i < minSteps) {
                continue;
            }

            const visitedHeat = visited.get(newX, newY, direction, newDirectionMoves);

            if (visitedHeat && visitedHeat <= heat) {
                return;
            }

            queue.push([newX, newY, direction, newDirectionMoves], heat);
            visited.set(newX, newY, direction, newDirectionMoves, heat);
        }
    }
}

const getQueue = () => {
    const queue = new FlatQueue();
    const values = [];

    return {
        push: (value, priority) => {
            values.push(value)
            queue.push(values.length - 1, priority);
        },
        pop: () => {
            const number = queue.pop();
            const value = values[number];
            return value;
        },
        count: () => queue.length,
    }
}

const getVisitedTracker = (cityMap) => {
    const visited =
        Array.from({ length: cityMap.length }, () =>
            Array.from({ length: cityMap[0].length }, () =>
                new Map()));

    const createKey = (direction, directionMoves) => `${direction[0]}${directionMoves}`;

    return {
        getAll: (x, y) => [...visited[y][x].values()],
        get: (x, y, direction, directionMoves) => visited[y][x].get(createKey(direction, directionMoves)),
        set: (x, y, direction, directionMoves, heat) => visited[y][x].set(createKey(direction, directionMoves), heat),
    };
}

const rotate = (direction, rotation) => {
    const directions = ['up', 'right', 'down', 'left'];
    const currentDirectionIndex = directions.indexOf(direction);
    const rotationIndex = rotation === 'right' ? 1 : -1;
    const newDirectionIndex = (currentDirectionIndex + rotationIndex + 4) % 4;

    return directions[newDirectionIndex];
}

const traverse = (cityMap, minSteps, maxSteps) => {
    const queue = getQueue();
    const visited = getVisitedTracker(cityMap);
    const move = getMover(cityMap, minSteps, maxSteps, queue, visited);

    queue.push([0, 0, 'right', 0], 0);
    queue.push([0, 0, 'down', 0], 0);

    while (queue.count() > 0) {
        const [x, y, direction, directionMoves] = queue.pop();
        const heat = visited.get(x, y, direction, directionMoves) || 0;

        if (directionMoves < maxSteps) {
            move(x, y, direction, heat, directionMoves);
        }

        if (directionMoves >= minSteps) {
            move(x, y, rotate(direction, 'left'), heat, 0);
            move(x, y, rotate(direction, 'right'), heat, 0);
        }
    }

    const values = visited.getAll(cityMap[0].length - 1, cityMap.length - 1);
    const minHeat = Math.min(...values);

    return minHeat;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const cityMap = fileContent.split('\r\n')
        .map((line) => line
            .split('')
            .map(Number));

    const minHeat = traverse(cityMap, 4, 10);

    return minHeat;
}

const solution = await solve('testCase');
console.log(solution);