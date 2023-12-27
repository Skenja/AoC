import * as fs from 'fs/promises';

const regex = /(\d+),(\d+),(\d+)~(\d+),(\d+),(\d+)/;

const parseBricks = (fileContent) => {
    const bricks = fileContent
        .split('\r\n')
        .map(line => line
            .match(regex)
            .slice(1)
            .map(Number))
        .map(([x1, y1, z1, x2, y2, z2], i) => ({
            i,
            x1, y1, z1: z1 - 1,
            x2, y2, z2: z2 - 1
        }));

    return bricks;
}

const getSpaceSizeFromBricks = (bricks) => {
    const spaceSize = bricks.reduce((acc, brick) => ({
        x: Math.max(acc.x, brick.x2 + 1),
        y: Math.max(acc.y, brick.y2 + 1),
        z: Math.max(acc.z, brick.z2 + 1)
    }), { x: 0, y: 0, z: 0 });

    return spaceSize
}

const generate3DSpace = (spaceSize) => {
    const space = Array.from({ length: spaceSize.z }, () =>
        Array.from({ length: spaceSize.y }, () =>
            Array(spaceSize.x).fill(null)
        ));

    return space;
}

const fillSpaceWithBricks = (space, bricks) => {
    for (const brick of bricks) {
        for (let z = brick.z1; z <= brick.z2; z++) {
            for (let y = brick.y1; y <= brick.y2; y++) {
                for (let x = brick.x1; x <= brick.x2; x++) {
                    space[z][y][x] = brick.i;
                }
            }
        }
    }

    return space;
}

const settleBricks = (spaceSize, space, bricks) => {
    const settledSpace = generate3DSpace(spaceSize);

    // start at bottom layer
    // for every empty space in the layer find the first brick directly above it
    // check if the entire brick is visible from current layer
    // if so, reposition it to start in the current layer

    return settledSpace;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const bricks = parseBricks(fileContent);
    const spaceSize = getSpaceSizeFromBricks(bricks);
    const space = generate3DSpace(spaceSize);
    const filledSpace = fillSpaceWithBricks(space, bricks);
    const settledSpace = settleBricks(spaceSize, filledSpace, bricks);

    return settledSpace
}

const solution = await solve('testCase');
console.log(solution); 