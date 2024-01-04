import * as fs from 'fs/promises';

const regex = /(-?\d+)/g;

const parseHailstones = (fileContent) => {
    const hailstones = fileContent
        .split('\r\n')
        .map(line => [...line.matchAll(regex)])
        .map(line => line.map(match => parseInt(match[1])))
        .map(([x, y, z, vx, vy, vz]) => ({ x, y, vx, vy }));

    return hailstones;
}

const generateHailstonesMatches = (hailstones) => {
    const hailstonesMatches = [];

    for (let i = 0; i < hailstones.length; i++) {
        for (let j = i + 1; j < hailstones.length; j++) {
            const hailstone1 = hailstones[i];
            const hailstone2 = hailstones[j];

            hailstonesMatches.push({ hailstone1, hailstone2 });
        }
    }

    return hailstonesMatches;
}

const calculateLineParameters = (hailstone) => {
    const x1 = hailstone.x;
    const x2 = hailstone.x + hailstone.vx;
    const y1 = hailstone.y;
    const y2 = hailstone.y + hailstone.vy;

    const dx = x2 - x1;
    const a = dx === 0 ? 0 : (y2 - y1) / dx;
    const b = y1 - a * x1;

    return [a, b];
}

const checkIfHailstonePassedPoint = (hailstone, x, y) => {
    // <-----x------i------ pos
    // <-----i------x------ neg
    // >-----x------i------ neg
    // >-----i------x------ pos

    const dx = (hailstone.x - x) * hailstone.vx;

    if (dx > 0) {
        return true;
    }

    const dy = (hailstone.y - y) * hailstone.vy;

    if (dy > 0) {
        return true;
    }

    return false;
}

const checkForHailstonesFutureCollision = (hailstone1, hailstone2, posMin, posMax) => {
    const [a1, b1] = calculateLineParameters(hailstone1);
    const [a2, b2] = calculateLineParameters(hailstone2);

    if (a1 === a2) {
        return false;
    }

    const intersectionX = (b2 - b1) / (a1 - a2);

    if (intersectionX < posMin || intersectionX > posMax) {
        return false;
    }

    const intersectionY = a1 * intersectionX + b1;

    if (intersectionY < posMin || intersectionY > posMax) {
        return false;
    }

    const hailstone1PassedPoint = checkIfHailstonePassedPoint(hailstone1, intersectionX, intersectionY);

    if (hailstone1PassedPoint) {
        return false;
    }

    const hailstone2PassedPoint = checkIfHailstonePassedPoint(hailstone2, intersectionX, intersectionY);

    if (hailstone2PassedPoint) {
        return false;
    }

    return true;
}

const solve = async (fileName, posMin, posMax) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const hailstones = parseHailstones(fileContent);
    const hailstonesMatches = generateHailstonesMatches(hailstones);
    const count = hailstonesMatches
        .map(x => checkForHailstonesFutureCollision(x.hailstone1, x.hailstone2, posMin, posMax))
        .filter(x => x)
        .length;

    return count;
}

const solution = await solve('testCase', 200000000000000, 400000000000000);
console.log(solution); 