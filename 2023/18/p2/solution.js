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

    for (const [direction, distance] of instructions) {
        const lastCorner = corners[corners.length - 1];
        const newCorner = {
            x: lastCorner.x + deltaX.get(direction) * distance,
            y: lastCorner.y + deltaY.get(direction) * distance,
        };
        lastCorner.direction = direction;
        corners.push(newCorner);
    }

    corners.pop();

    return corners;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const instructions = parseInstruction(lines);
    const corners = calculateCorners(instructions);

    // Shoelace formula
    let area = 0;

    for (let i = 0; i < corners.length; i++) {
        var nextI = (i + 1) % corners.length;
        var prevI = (i - 1 + corners.length) % corners.length;
        area += corners[i].y * (corners[nextI].x - corners[prevI].x);
    }

    area = Math.abs(area) / 2;

    const perimeter = instructions.reduce((acc, [_, distance]) => acc + distance, 0);
    area += perimeter / 2 + 1;

    return area;
}

const solution = await solve('testCase');
console.log(solution);