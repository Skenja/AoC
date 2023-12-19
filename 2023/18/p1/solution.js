import * as fs from 'fs/promises';

const generateMap = (instructions) => {
    const map = [['S']];
    let x = 0;
    let y = 0;

    for (const [direction, distance, color] of instructions) {
        if (direction === 'R') {
            const row = map[y];
            const missingRoom = distance - (row.length - x - 1);

            if (missingRoom > 0) {
                const newTrench = Array(missingRoom).fill('.');

                for (const row of map) {
                    row.push(...newTrench);
                }
            }

            for (let i = 1; i <= distance; i++) {
                row[x + i] = '#';
            }

            x += distance;
        }

        if (direction === 'L') {
            const missingRoom = distance - x;

            if (missingRoom > 0) {
                const newTrench = Array(missingRoom).fill('.');

                for (const row of map) {
                    row.unshift(...newTrench);
                }

                x += missingRoom;
            }

            const row = map[y];

            for (let i = 1; i <= distance; i++) {
                row[x - i] = '#';
            }

            x -= distance;
        }

        if (direction === 'U') {
            const missingRoom = distance - y;

            if (missingRoom > 0) {
                const dots = '.'.repeat(map[0].length).split('');
                const newTrench = Array.from({ length: missingRoom }, _ => [...dots]);

                map.unshift(...newTrench);
                y += missingRoom;
            }

            for (let i = 1; i <= distance; i++) {
                map[y - i][x] = '#';
            }

            y -= distance;
        }

        if (direction === 'D') {
            const missingRoom = distance - (map.length - y - 1);

            if (missingRoom > 0) {
                const dots = '.'.repeat(map[0].length).split('');
                const newTrench = Array.from({ length: missingRoom }, _ => [...dots]);

                map.push(...newTrench);
            }

            for (let i = 1; i <= distance; i++) {
                map[y + i][x] = '#';
            }

            y += distance;
        }
    }

    // Pad the map with empty tiles on all sides to make the code for exploring simpler
    const horizontalPad = '.'.repeat(map[0].length).split('');
    map.unshift([...horizontalPad]);
    map.push([...horizontalPad]);

    for (const row of map) {
        row.unshift('.');
        row.push('.');
    }

    return map;
}

const measureArea = (matrix) => {
    let numberOfTilesInsideOfLoop = 0;

    for (let y = 1; y < matrix.length - 1; y++) {
        let isInside = false;
        let boundryCrossings = 0;
        let wasInsideWhenEnteringHorizontalBoundry = null;
        let enteredHorizontalBoundryFrom = null;

        for (let x = 1; x < matrix[0].length - 1; x++) {
            const tiles = matrix[y].slice(x - 1, x + 2);
            const isOnHorizontalBoundry = tiles[1] === '#' && (tiles[0] === '#' || tiles[2] === '#');
            const isEnteringHorizontalBoundry = tiles[0] === '.' && isOnHorizontalBoundry;
            const isExitingHorizontalBoundry = tiles[0] === '#' && tiles[1] === '.' && !!enteredHorizontalBoundryFrom;
            const isExitingVerticalBoundry = tiles[0] === '#' && tiles[1] === '.' && !isExitingHorizontalBoundry;

            if (isEnteringHorizontalBoundry) {
                wasInsideWhenEnteringHorizontalBoundry = isInside;
                enteredHorizontalBoundryFrom = matrix[y - 1][x] === '#' ? 'U' : 'D';
                boundryCrossings++;
            }

            if (isExitingHorizontalBoundry) {
                const exitedHorizontalBoundryTo = matrix[y - 1][x - 1] === '#' ? 'U' : 'D';
                const exitedInversely = exitedHorizontalBoundryTo !== enteredHorizontalBoundryFrom;
                isInside = (wasInsideWhenEnteringHorizontalBoundry ^ exitedInversely) === 1;

                if (isInside === wasInsideWhenEnteringHorizontalBoundry) {
                    boundryCrossings++;
                }

                enteredHorizontalBoundryFrom = null;
                wasInsideWhenEnteringHorizontalBoundry = null;
            }

            if (isExitingVerticalBoundry) {
                boundryCrossings++;

                if (boundryCrossings % 2 === 0) {
                    isInside = !isInside;
                }
            }

            if (tiles[1] === '#') {
                isInside = true;
            }

            if (isInside) {
                numberOfTilesInsideOfLoop++;
            }
        }
    }

    return numberOfTilesInsideOfLoop;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const instructions = fileContent
        .split('\r\n')
        .map(line => line.split(' '))
        .map(([p1, p2, p3]) => ([p1, parseInt(p2), p3.slice(1, -1)]));

    const map = generateMap(instructions);
    const area = measureArea(map);

    return area;
}

const solution = await solve('testCase');
console.log(solution);