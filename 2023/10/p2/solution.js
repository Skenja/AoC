import * as fs from 'fs/promises';

const getSCoordinates = (fileContent, lines) => {
    const lineLength = lines[0].length + 2; // +2 accounts for the \r\n
    const indexOfS = fileContent.match(/S/).index;
    const coordinatesOfS = [indexOfS % lineLength, Math.floor(indexOfS / lineLength)];

    return coordinatesOfS;
}

const getValidCoordinatesOptions = (matrix, previousCoordinates, currentCoordinates, currentTile) => {
    const coordinateOptions = [];

    const rightTile = { coordinates: [currentCoordinates[0] + 1, currentCoordinates[1]], tiles: ['-', 'J', '7'] };
    const leftTile = { coordinates: [currentCoordinates[0] - 1, currentCoordinates[1]], tiles: ['-', 'L', 'F'] };
    const bottomTile = { coordinates: [currentCoordinates[0], currentCoordinates[1] + 1], tiles: ['|', 'L', 'J'] };
    const topTile = { coordinates: [currentCoordinates[0], currentCoordinates[1] - 1], tiles: ['|', 'F', '7'] };

    if (currentTile === 'S') {
        coordinateOptions.push(rightTile, leftTile, bottomTile, topTile);
    }

    if (currentTile === '|') {
        coordinateOptions.push(bottomTile, topTile);
    }

    if (currentTile === '-') {
        coordinateOptions.push(rightTile, leftTile);
    }

    if (currentTile === 'F') {
        coordinateOptions.push(rightTile, bottomTile);
    }

    if (currentTile === '7') {
        coordinateOptions.push(leftTile, bottomTile);
    }

    if (currentTile === 'J') {
        coordinateOptions.push(leftTile, topTile);
    }

    if (currentTile === 'L') {
        coordinateOptions.push(rightTile, topTile);
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

const getLoopCoordinates = (matrix, sCoordinates) => {
    const startingCoordinates = getNextTileCoordinates(matrix, null, sCoordinates);
    const previousCoordinates = [sCoordinates, startingCoordinates];

    while (true) {
        const nextTileCoordinates = getNextTileCoordinates(matrix, previousCoordinates[previousCoordinates.length - 2], previousCoordinates[previousCoordinates.length - 1]);

        if (nextTileCoordinates === 'S') {
            break;
        }

        previousCoordinates.push(nextTileCoordinates);
    }

    return previousCoordinates;
}

const buildMapOfBoundries = (matrixHeight, loopCoordinates) => {
    const mapOfBoundries = new Map();

    for (let i = 0; i < matrixHeight; i++) {
        const coordinatesAtY = loopCoordinates.filter(coordinates => coordinates[1] === i);
        const xCoordinates = coordinatesAtY.map(coordinates => coordinates[0]);

        if (xCoordinates.length) {
            mapOfBoundries.set(i, xCoordinates);
        }
    }

    return mapOfBoundries;
}

const calculateSideOfTile = (tile1, tile2) => {
    if (tile1[0] === tile2[0]) {
        if (tile1[1] < tile2[1]) {
            return 'bottom';
        } else {
            return 'top';
        }
    } else {
        if (tile1[0] < tile2[0]) {
            return 'right';
        } else {
            return 'left';
        }
    }
}

const replaceSWithPipe = (matrix, loopCoordinates) => {
    const newMatrix = matrix.map(line => [...line]);
    const sCoordinates = loopCoordinates[0];
    const startCoordinates = loopCoordinates[1];
    const endCoordinates = loopCoordinates[loopCoordinates.length - 1];

    const startDirection = calculateSideOfTile(sCoordinates, startCoordinates);
    const endDirection = calculateSideOfTile(sCoordinates, endCoordinates);
    const directions = [startDirection, endDirection];

    if (directions.includes('top') && directions.includes('bottom')) {
        newMatrix[sCoordinates[1]][sCoordinates[0]] = '|';
    } else if (directions.includes('left') && directions.includes('right')) {
        newMatrix[sCoordinates[1]][sCoordinates[0]] = '-';
    } else if (directions.includes('top') && directions.includes('right')) {
        newMatrix[sCoordinates[1]][sCoordinates[0]] = 'L';
    } else if (directions.includes('top') && directions.includes('left')) {
        newMatrix[sCoordinates[1]][sCoordinates[0]] = 'J';
    } else if (directions.includes('bottom') && directions.includes('right')) {
        newMatrix[sCoordinates[1]][sCoordinates[0]] = 'F';
    } else if (directions.includes('bottom') && directions.includes('left')) {
        newMatrix[sCoordinates[1]][sCoordinates[0]] = '7';
    }

    return newMatrix;
};

const calculateNumerOfTilesInsideOfLoop = (matrix, mapOfBoundries) => {
    let numberOfTilesInsideOfLoop = 0;

    for (let y = 0; y < matrix.length; y++) {
        const boundries = mapOfBoundries.get(y) || [];
        let isInside = false;
        let enteredHorizontalBoundryOn = null;

        for (let x = 0; x < matrix[0].length; x++) {
            const tile = matrix[y][x];
            const isOnBoundry = boundries.includes(x);
            const isCrossingVerticalBoundry = isOnBoundry && tile !== '-';

            if (isOnBoundry && ['L', 'F'].includes(tile)) {
                enteredHorizontalBoundryOn = tile;
            }

            const exitingHorizontalBoundryInversly =
                (enteredHorizontalBoundryOn === 'L' && tile === '7')
                || (enteredHorizontalBoundryOn === 'F' && tile === 'J');

            const invertIsInside = isOnBoundry && (exitingHorizontalBoundryInversly || tile === '|');

            if (isCrossingVerticalBoundry && invertIsInside) {
                isInside = !isInside;
            }

            if (!isOnBoundry && isInside) {
                numberOfTilesInsideOfLoop++;
            }
        }
    }

    return numberOfTilesInsideOfLoop;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const sCoordinates = getSCoordinates(fileContent, lines);
    const matrix = lines.map(line => line.split(''));
    const loopCoordinates = getLoopCoordinates(matrix, sCoordinates);
    const mapOfBoundries = buildMapOfBoundries(matrix.length, loopCoordinates);
    const modifiedMatrix = replaceSWithPipe(matrix, loopCoordinates);
    const numberOfTilesInsideOfLoop = calculateNumerOfTilesInsideOfLoop(modifiedMatrix, mapOfBoundries);

    return numberOfTilesInsideOfLoop;
}

const solution = await solve('testCase');
console.log(solution);