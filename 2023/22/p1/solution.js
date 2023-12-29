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

const settleBricks = (spaceSize, space) => {
    const settledSpace = generate3DSpace(spaceSize);
    const emptyLayerMemory = generate2DSpace(spaceSize);
    let highestLayerAfterSettling = -1;

    for (const layerIndex in space) {
        const layer = space[layerIndex];
        const movableBrickLowestLayerMemory = new Map();

        for (const y in layer) {
            for (const x in layer[y]) {
                if (layer[y][x] === null) {
                    continue;
                }

                const brick = layer[y][x];
                const lowestLayerOnThisPosition = emptyLayerMemory[y][x] || layerIndex;
                const previousLowestLayer = movableBrickLowestLayerMemory.get(brick) || -1;
                const newLowestLayer = Math.max(lowestLayerOnThisPosition, previousLowestLayer);

                if (newLowestLayer === layerIndex) {
                    movableBrickLowestLayerMemory.delete(brick);
                } else {
                    movableBrickLowestLayerMemory.set(brick, newLowestLayer);
                }
            }
        }

        for (const y in layer) {
            for (const x in layer[y]) {
                if (layer[y][x] === null) {
                    if (!emptyLayerMemory[y][x]) {
                        emptyLayerMemory[y][x] = layerIndex;
                    }

                    continue;
                }

                const brick = layer[y][x];
                const lowestLayer = movableBrickLowestLayerMemory.get(brick);

                if (!lowestLayer) {
                    settledSpace[layerIndex][y][x] = brick;
                    emptyLayerMemory[y][x] = null;
                    highestLayerAfterSettling = Math.max(highestLayerAfterSettling, layerIndex);

                    continue;
                }

                settledSpace[lowestLayer][y][x] = brick;
                emptyLayerMemory[y][x] = lowestLayer + 1;
                highestLayerAfterSettling = Math.max(highestLayerAfterSettling, lowestLayer);
            }
        }
    }

    return settledSpace.slice(0, highestLayerAfterSettling + 1);
}

/*
    A -> B, C
    B -> D, E
    C -> D, E
    D -> F
    E -> F
    F -> G

    G -> F
    F -> D, E
    E -> B, C
    D -> B, C
    C -> A
    B -> A
*/

const countDisintegrateableBricks = (space, bricks) => {
    const disintegrateableBricks = bricks.map(brick => brick.i);

    for (let z = space.length - 1; z > 0; z--) {

    }

    return disintegrateableBricks.length;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const bricks = parseBricks(fileContent);
    const spaceSize = getSpaceSizeFromBricks(bricks);
    const space = generate3DSpace(spaceSize);
    const filledSpace = fillSpaceWithBricks(space, bricks);
    const settledSpace = settleBricks(spaceSize, filledSpace);
    const count = countDisintegrateableBricks(settledSpace);

    return count
}

const solution = await solve('testCase');
console.log(solution); 