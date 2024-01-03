import * as fs from 'fs/promises';

const checkIfSameCoordinates = (tile1, tile2) => {
    const [y1, x1] = tile1;
    const [y2, x2] = tile2;

    if (y1 === y2 && x1 === x2) {
        return true;
    }

    return false;
}

const validateNextStepOption = (map, previousTile, pastTiles, option) => {
    const stringifiedOption = stringify(option);

    if (pastTiles.has(stringifiedOption)) {
        return false;
    }

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

    return true;
}

const stringify = (tile) => {
    const [y, x] = tile;
    return `${y},${x}`;
}

const getNextStepOptions = (map, currentTile, previousTile, pastTiles, steps) => {
    const [y, x] = currentTile;
    const options = [
        [y - 1, x],
        [y + 1, x],
        [y, x - 1],
        [y, x + 1]
    ];

    const validOptions = options.filter(option => validateNextStepOption(map, previousTile, pastTiles, option));

    if (validOptions.length === 0) {
        return [];
    }

    pastTiles.add(stringify(currentTile));

    if (validOptions.length > 1) {
        return validOptions.map(option => [new Set([...pastTiles]), currentTile, option, steps + 1]);
    } else {
        return validOptions.map(option => [pastTiles, currentTile, option, steps + 1]);
    }
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const map = fileContent.split('\r\n').map(row => row.split(''));
    const start = [0, 1];
    const end = [map.length - 1, map[0].length - 2];
    const queue = getNextStepOptions(map, start, null, new Set(), 0);

    let maxSteps = 0;

    while (queue.length > 0) {
        const [pastTiles, previousTile, currentTile, steps] = queue.pop();
        const reachedEnd = checkIfSameCoordinates(currentTile, end);

        if (reachedEnd) {
            if (steps > maxSteps) console.log(maxSteps)
            maxSteps = Math.max(maxSteps, steps);
            continue;
        }

        const nextStepOptions = getNextStepOptions(map, currentTile, previousTile, pastTiles, steps);

        for (const option of nextStepOptions) {
            queue.push(option);
        }
    }

    return maxSteps;
}

const solution = await solve('testCase');
console.log(solution);