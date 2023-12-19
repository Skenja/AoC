import * as fs from 'fs/promises';

const directionsMap = ['R', 'D', 'L', 'U'];

const parseInstruction = (lines) => {
    const instructions = lines.map(line => line.split(' '))
        .map(([p1, p2, p3]) => {
            const distanceHex = '0x' + p3.slice(2, -2);
            const distance = Number(distanceHex);

            const directionNumberString = p3.slice(-2, -1);
            const directionNumber = Number(directionNumberString);
            const direction = directionsMap[directionNumber];

            return [direction, distance];
        });

    return instructions;
}

const deltaX = new Map([
    ['R', 1],
    ['L', -1],
    ['D', 0],
    ['U', 0],
]);

const deltaY = new Map([
    ['R', 0],
    ['L', 0],
    ['D', 1],
    ['U', -1],
]);

const calculateCorners = (instructions) => {
    const corners = [{ x: 0, y: 0 }];
    let minX = 0;
    let minY = 0;

    for (const [direction, distance] of instructions) {
        const lastCorner = corners[corners.length - 1];
        const newCorner = {
            x: lastCorner.x + deltaX.get(direction) * distance,
            y: lastCorner.y + deltaY.get(direction) * distance,
        };
        lastCorner.direction = direction;
        corners.push(newCorner);

        if (newCorner.x < minX) {
            minX = newCorner.x;
        }

        if (newCorner.y < minY) {
            minY = newCorner.y;
        }
    }

    // Last one is the same as first one
    corners.pop();

    // normalize coordinates
    if (minX < 0) {
        const shift = Math.abs(minX);
        corners.forEach(corner => corner.x += shift);
    }

    if (minY < 0) {
        const shift = Math.abs(minY);
        corners.forEach(corner => corner.y += shift);
    }

    return corners;
}

const createPairs = (points) => {
    const pairs = [];

    for (let i = 0; i < points.length; i += 2) {
        pairs.push([points[i], points[i + 1]]);
    }

    return pairs;
}

const constructRows = (corners) => {
    const rowsMap = new Map();

    for (let i = 0; i < corners.length; i++) {
        if (!rowsMap.has(corners[i].y)) {
            rowsMap.set(corners[i].y, []);
        }

        const row = rowsMap.get(corners[i].y);
        row.push(corners[i].x);
    }

    const rows = [];
    const yValues = [...rowsMap.keys()].sort((a, b) => a - b);

    for (const y of yValues) {
        const sortedXs = rowsMap.get(y).sort((a, b) => a - b);
        const pairs = createPairs(sortedXs);

        rows.push({
            y: y,
            x: pairs
        });
    }

    return rows;
}

const checkForOverlap = (pair, referencePairs) => {
    for (const referencePair of referencePairs) {
        if (pair[0] >= referencePair[0] && pair[1] <= referencePair[1]) {
            return true;
        }
    }

    return false;
}

const createPairsForTouchingLines = (xs) => {
    const pairs = [
        [xs[0], xs[1]]
    ];

    for (let i = 1; i < xs.length - 1; i++) {
        pairs.push([xs[i] + 1, xs[i + 1]]);
    }

    return pairs;
}

const mergePairs = (pairs) => {
    if (pairs.length === 0) {
        return [];
    }

    const mergedPairs = [];
    let startPoint = pairs[0][0];

    for (let i = 0; i < pairs.length - 1; i++) {
        const pair1 = pairs[i];
        const pair2 = pairs[i + 1];

        if (pair1[1] === pair2[0]) {
            continue;
        }

        mergedPairs.push([startPoint, pair1[1]]);
        startPoint = pair2[0];
    }

    mergedPairs.push([startPoint, pairs[pairs.length - 1][1]]);

    return mergedPairs;
}

const measureArea = (rows) => {
    let area = 0;
    let row0 = rows[0];
    let insidePairs = row0.x;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        for (const insidePair of insidePairs) {
            const width = insidePair[1] - insidePair[0] + 1;
            const height = row.y - row0.y + 1;
            area += width * height;
            // console.log(row0.y, row.y, insidePair, width, height, area)
        }

        const setOfXs = new Set([...insidePairs.flat(), ...row.x.flat()]);
        const sortedXs = [...setOfXs].sort((a, b) => a - b);
        const pairs = createPairsForTouchingLines(sortedXs);
        const newInsidePairs = [];

        for (const pair of pairs) {
            const wasInside = checkForOverlap(pair, insidePairs);
            const shouldFlip = checkForOverlap(pair, row.x);
            const xor = wasInside ^ shouldFlip;

            if (xor === 1) {
                newInsidePairs.push(pair);
            }
        }

        insidePairs = mergePairs(newInsidePairs);
        row0 = row;
    }

    return area;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const instructions = parseInstruction(lines);
    // const instructions = lines
    //     .map(line => line.split(' '))
    //     .map(([p1, p2, p3]) => ([p1, parseInt(p2)]));
    const corners = calculateCorners(instructions);
    const rows = constructRows(corners);
    // console.log(corners);
    const area = measureArea(rows);

    return area;
}

const solution = await solve('testCase');
console.log(solution);