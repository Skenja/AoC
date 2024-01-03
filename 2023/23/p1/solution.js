import * as fs from 'fs/promises';

const getDirection = (previousTile, currentTile) => {
    const [y, x] = currentTile;
    const [pY, pX] = previousTile;

    if (y === pY) {
        return x > pX ? 'right' : 'left';
    } else {
        return y > pY ? 'down' : 'up';
    }
}

const checkIfSameCoordinates = (tile1, tile2) => {
    const [y1, x1] = tile1;
    const [y2, x2] = tile2;

    if (y1 === y2 && x1 === x2) {
        return true;
    }

    return false;
}

const validateNextStepOption = (map, previousTile, currentTile, option) => {
    const [y, x] = option;

    if (y < 0 || y >= map.length) {
        return false;
    }

    if (previousTile) {
        const isSame = checkIfSameCoordinates(previousTile, option);

        if (isSame) {
            return false;
        }
    }

    const tile = map[y][x];

    if (tile === '#') {
        return false;
    }

    if (tile === '.') {
        return true;
    }

    const direction = getDirection(currentTile, option);

    if (direction === 'right' && tile === '>') {
        return true;
    }

    if (direction === 'left' && tile === '<') {
        return true;
    }

    if (direction === 'up' && tile === '^') {
        return true;
    }

    if (direction === 'down' && tile === 'v') {
        return true;
    }

    return false;
}

const getNextStepOptions = (map, currentTile, previousTile, steps) => {
    const [y, x] = currentTile;
    const options = [
        [y - 1, x],
        [y + 1, x],
        [y, x - 1],
        [y, x + 1]
    ];

    const validOptions = options
        .filter(option => validateNextStepOption(map, previousTile, currentTile, option))
        .map(option => [currentTile, option, steps + 1]);

    return validOptions;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const map = fileContent.split('\r\n').map(row => row.split(''));
    const start = [0, 1];
    const end = [map.length - 1, map[0].length - 2];
    const queue = getNextStepOptions(map, start, null, 0);

    let maxSteps = 0;

    while (queue.length > 0) {
        const [previousTile, currentTile, steps] = queue.shift();
        const reachedEnd = checkIfSameCoordinates(currentTile, end);

        if (reachedEnd) {
            maxSteps = Math.max(maxSteps, steps);
            continue;
        }

        const nextStepOptions = getNextStepOptions(map, currentTile, previousTile, steps);

        for (const option of nextStepOptions) {
            queue.push(option);
        }
    }

    return maxSteps;
}

const solution = await solve('testCase');
console.log(solution); 