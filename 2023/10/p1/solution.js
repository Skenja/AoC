import * as fs from 'fs/promises';

const getSCoordinates = (fileContent, lines) => {
    const lineLength = lines[0].length + 2; // +2 accounts for the \r\n
    const indexOfS = fileContent.match(/S/).index;
    const coordinatesOfS = [indexOfS % lineLength, Math.floor(indexOfS / lineLength)];

    return coordinatesOfS;
}

const getValidCoordinatesOptions = (matrix, previousCoordinates, currentCoordinates, currentTile) => {
    const coordinateOptions = [];

    if (currentTile === 'S') {
        coordinateOptions.push(
            { coordinates: [currentCoordinates[0], currentCoordinates[1] + 1], tiles: ['|', 'L', 'J'] },
            { coordinates: [currentCoordinates[0] + 1, currentCoordinates[1]], tiles: ['-', 'J', '7'] },
            { coordinates: [currentCoordinates[0], currentCoordinates[1] - 1], tiles: ['|', 'F', '7'] },
            { coordinates: [currentCoordinates[0] - 1, currentCoordinates[1]], tiles: ['-', 'L', 'F'] },
        );
    }

    if (currentTile === '|') {
        coordinateOptions.push(
            { coordinates: [currentCoordinates[0], currentCoordinates[1] + 1], tiles: ['|', 'L', 'J'] },
            { coordinates: [currentCoordinates[0], currentCoordinates[1] - 1], tiles: ['|', 'F', '7'] }
        );
    }

    if (currentTile === '-') {
        coordinateOptions.push(
            { coordinates: [currentCoordinates[0] + 1, currentCoordinates[1]], tiles: ['-', 'J', '7'] },
            { coordinates: [currentCoordinates[0] - 1, currentCoordinates[1]], tiles: ['-', 'L', 'F'] },
        );
    }

    if (currentTile === 'F') {
        coordinateOptions.push(
            { coordinates: [currentCoordinates[0] + 1, currentCoordinates[1]], tiles: ['-', 'J', '7'] },
            { coordinates: [currentCoordinates[0], currentCoordinates[1] + 1], tiles: ['|', 'L', 'J'] },
        );
    }

    if (currentTile === '7') {
        coordinateOptions.push(
            { coordinates: [currentCoordinates[0], currentCoordinates[1] + 1], tiles: ['|', 'L', 'J'] },
            { coordinates: [currentCoordinates[0] - 1, currentCoordinates[1]], tiles: ['-', 'L', 'F'] },
        );
    }

    if (currentTile === 'J') {
        coordinateOptions.push(
            { coordinates: [currentCoordinates[0] - 1, currentCoordinates[1]], tiles: ['-', 'L', 'F'] },
            { coordinates: [currentCoordinates[0], currentCoordinates[1] - 1], tiles: ['|', 'F', '7'] }
        );
    }

    if (currentTile === 'L') {
        coordinateOptions.push(
            { coordinates: [currentCoordinates[0] + 1, currentCoordinates[1]], tiles: ['-', 'J', '7'] },
            { coordinates: [currentCoordinates[0], currentCoordinates[1] - 1], tiles: ['|', 'F', '7'] }
        );
    }

    const validCoordinates = [];

    for (let i = 0; i < coordinateOptions.length; i++) {
        const [x, y] = coordinateOptions[i].coordinates;

        const isSameAsPrevious = previousCoordinates ? x === previousCoordinates[0] && y === previousCoordinates[1] : false;
        const isOutOfBounds = x < 0 || y < 0 || x >= matrix[0].length || y >= matrix.length;

        if (!isSameAsPrevious && !isOutOfBounds) {
            validCoordinates.push(coordinateOptions[i]);
        }
    }

    return validCoordinates;
};

const getNextTileCoordinates = (matrix, previousCoordinates, currentCoordinates) => {
    const currentTile = matrix[currentCoordinates[1]][currentCoordinates[0]];
    const validCoordinates = getValidCoordinatesOptions(matrix, previousCoordinates, currentCoordinates, currentTile);

    for (const coordinates of validCoordinates) {
        const nextTile = matrix[coordinates.coordinates[1]][coordinates.coordinates[0]];
        if (nextTile === 'S') {
            return 'S';
        }

        if (nextTile === '.') {
            continue;
        }

        const matchesValidTile = coordinates.tiles.includes(nextTile);

        if (matchesValidTile) {
            return coordinates.coordinates;
        }
    }
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const sCoordinates = getSCoordinates(fileContent, lines);
    const matrix = lines.map(line => line.split(''));

    const startingCoordinates = getNextTileCoordinates(matrix, null, sCoordinates);
    let previousCoordinates = [sCoordinates, startingCoordinates];
    let stepCount = 1;

    while (true) {
        const nextTileCoordinates = getNextTileCoordinates(matrix, previousCoordinates[previousCoordinates.length - 2], previousCoordinates[previousCoordinates.length - 1]);
        stepCount++;

        if (nextTileCoordinates === 'S') {
            break;
        }

        previousCoordinates.push(nextTileCoordinates);
    }

    return Math.ceil(stepCount / 2);
}

const solution = await solve('testCase');
console.log(solution);
