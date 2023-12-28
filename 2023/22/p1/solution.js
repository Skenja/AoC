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

const generate2DSpace = ({ x, y }) => {
    const space = Array.from({ length: y }, () =>
        Array(x).fill(null)
    );

    return space;
}

const generate3DSpace = ({ x, y, z }) => {
    const space = Array.from({ length: z }, () => generate2DSpace({ x, y }));

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
    const emptyLayerMemory = generate2DSpace(spaceSize);

    for (const layerIndex in space) {
        // first go through the bricks in the current layer and get the layer they belong in
        // then move them
        // then fill in emptyLayerMemory

        const layer = space[layerIndex];
        const brickLowestLayerMemory = new Map();

        for (const y in layer) {
            for (const x in layer[y]) {
                if (layer[y][x] === null) {
                    emptyLayerMemory[y][x] = Math.min(emptyLayerMemory[y][x] ?? Infinity, layerIndex);
                    continue;
                }

                const brick = layer[y][x];

                if (!brickLowestLayerMemory.has(brick)) {
                    brickLowestLayerMemory.set(brick, emptyLayerMemory[y][x]);
                }

                const lowestLayer = brickLowestLayerMemory.get(brickIndex) || -1;
                brickLowestLayerMemory.set(brick, Math.max(lowestLayer, layerIndex));
            }
        }
    }

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