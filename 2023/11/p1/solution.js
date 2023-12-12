import * as fs from 'fs/promises';

const expandRows = (lines) => {
    const newRows = [];

    for (const line of lines) {
        const containsGalaxies = line.indexOf('#') > -1;
        if (containsGalaxies) {
            newRows.push(line);
        } else {
            newRows.push(line, line);
        }
    }

    return newRows;
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

const expandUniverse = (lines) => {
    const newRows = expandRows(lines);
    const flippedUniverse = flipUniverse(newRows);
    const newRows2 = expandRows(flippedUniverse);
    const flippedUniverse2 = flipUniverse(newRows2);

    return flippedUniverse2;
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

const calculateDistancesBetweenGalaxies = (galaxyCoordinates) => {
    const distances = [];

    for (let i = 0; i < galaxyCoordinates.length; i++) {
        const galaxy1 = galaxyCoordinates[i];

        for (let j = i + 1; j < galaxyCoordinates.length; j++) {
            const galaxy2 = galaxyCoordinates[j];

            const distance = Math.abs(galaxy1.x - galaxy2.x) + Math.abs(galaxy1.y - galaxy2.y);

            distances.push(distance);
        }
    }

    return distances;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const expandedUniverse = expandUniverse(lines);
    const galaxiesCoordinates = findGalaxiesCoordinates(expandedUniverse);
    const distances = calculateDistancesBetweenGalaxies(galaxiesCoordinates);
    const sumOfDistances = distances.reduce((acc, curr) => acc + curr, 0);

    return sumOfDistances;
}

const solution = await solve('testCase');
console.log(solution);
