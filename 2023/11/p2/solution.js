import * as fs from 'fs/promises';

const getEmptyRows = (lines) => {
    const emptyRows = [];

    for (let i = 0; i < lines.length; i++) {
        const containsGalaxies = lines[i].indexOf('#') > -1;

        if (!containsGalaxies) {
            emptyRows.push(i);
        }
    }

    return emptyRows;
}

const flipUniverse = (lines) => {
    const newRows = [];

    for (let x = 0; x < lines[0].length; x++) {
        let newRow = '';

        for (let y = 0; y < lines.length; y++) {
            newRow += lines[y].charAt(x);
        }

        newRows.push(newRow);
    }

    return newRows;
}

const getEmptyColumns = (lines) => {
    const flippedUniverse = flipUniverse(lines);
    const emptyColumns = getEmptyRows(flippedUniverse);

    return emptyColumns;
};

const findGalaxiesCoordinates = (lines) => {
    const galaxiesCoordinates = [];

    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];

        for (let x = 0; x < line.length; x++) {
            const char = line.charAt(x);

            if (char === '#') {
                galaxiesCoordinates.push({ x, y });
            }
        }
    }

    return galaxiesCoordinates;
}

const calculateDistancesBetweenGalaxies = (galaxyCoordinates, emptyRows, emptyColumns) => {
    const distances = [];

    for (let i = 0; i < galaxyCoordinates.length; i++) {
        const galaxy1 = galaxyCoordinates[i];

        for (let j = i + 1; j < galaxyCoordinates.length; j++) {
            const galaxy2 = galaxyCoordinates[j];

            const sY = Math.min(galaxy1.y, galaxy2.y);
            const lY = Math.max(galaxy1.y, galaxy2.y);
            const sX = Math.min(galaxy1.x, galaxy2.x);
            const lX = Math.max(galaxy1.x, galaxy2.x);

            const crossedEmptyRows = emptyRows.filter(row => row > sY && row < lY);
            const crossedEmptyColumns = emptyColumns.filter(column => column > sX && column < lX);
            const multiple = 1_000_000 - 1;
            const distance =
                (lX - sX) + (crossedEmptyRows.length * multiple)
                + (lY - sY) + (crossedEmptyColumns.length * multiple);

            distances.push(distance);
        }
    }

    return distances;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const emptyRows = getEmptyRows(lines);
    const emptyColumns = getEmptyColumns(lines);
    const galaxiesCoordinates = findGalaxiesCoordinates(lines);
    const distances = calculateDistancesBetweenGalaxies(galaxiesCoordinates, emptyRows, emptyColumns);
    const sumOfDistances = distances.reduce((acc, curr) => acc + curr, 0);

    return sumOfDistances;
}

const solution = await solve('testCase');
console.log(solution);