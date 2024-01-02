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
                const brick = layer[y][x];

                if (brick === null) {
                    continue;
                }

                const lowestLayerOnThisPosition = emptyLayerMemory[y][x] || layerIndex;
                const previousLowestLayerForBrick = movableBrickLowestLayerMemory.get(brick) || -1;
                const newLowestLayerForBrick = Math.max(lowestLayerOnThisPosition, previousLowestLayerForBrick);

                if (newLowestLayerForBrick === layerIndex) {
                    movableBrickLowestLayerMemory.delete(brick);
                } else {
                    movableBrickLowestLayerMemory.set(brick, newLowestLayerForBrick);
                }
            }
        }

        for (const y in layer) {
            for (const x in layer[y]) {
                const brick = layer[y][x];

                if (brick === null) {
                    if (emptyLayerMemory[y][x] === null) {
                        emptyLayerMemory[y][x] = layerIndex;
                    }

                    continue;
                }

                if (!movableBrickLowestLayerMemory.has(brick)) {
                    settledSpace[layerIndex][y][x] = brick;
                    emptyLayerMemory[y][x] = null;
                    highestLayerAfterSettling = Math.max(highestLayerAfterSettling, layerIndex);

                    continue;
                }

                const lowestLayer = movableBrickLowestLayerMemory.get(brick);

                settledSpace[lowestLayer][y][x] = brick;
                emptyLayerMemory[y][x] = lowestLayer + 1;
                highestLayerAfterSettling = Math.max(highestLayerAfterSettling, lowestLayer);
            }
        }
    }

    return settledSpace.slice(0, highestLayerAfterSettling + 1);
}

const getBrickSupports = (space) => {
    const supportedByMap = new Map();
    const supportsMap = new Map();

    for (let z = space.length - 1; z > 0; z--) {
        for (let y = 0; y < space[z].length; y++) {
            for (let x = 0; x < space[z][y].length; x++) {
                const brick = space[z][y][x];
                const brickBelow = space[z - 1][y][x];

                if (brick === null || brickBelow === null || brick === brickBelow) {
                    continue;
                }

                if (!supportedByMap.has(brick)) {
                    supportedByMap.set(brick, new Set());
                }

                const currentBrickSupport = supportedByMap.get(brick);
                currentBrickSupport.add(brickBelow);
            }
        }
    }

    for (let z = 0; z < space.length - 1; z++) {
        for (let y = 0; y < space[z].length; y++) {
            for (let x = 0; x < space[z][y].length; x++) {
                const brick = space[z][y][x];
                const brickAbove = space[z + 1][y][x];

                if (brick === null || brickAbove === null || brick === brickAbove) {
                    continue;
                }

                if (!supportsMap.has(brick)) {
                    supportsMap.set(brick, new Set());
                }

                const currentBrickSupport = supportsMap.get(brick);
                currentBrickSupport.add(brickAbove);
            }
        }
    }

    return [supportedByMap, supportsMap];
}

const sumFallenBricks = (supportedByMap, supportsMap, bricks) => {
    let sum = 0;

    for (const brick of bricks.map(x => x.i)) {
        const goneBricks = new Set([brick]);
        const queue = [brick];

        while (queue.length > 0) {
            const currentBrick = queue.shift();

            if (!supportsMap.has(currentBrick)) {
                continue;
            }

            const supports = supportsMap.get(currentBrick);

            for (const support of supports) {
                const supportedBy = [...supportedByMap.get(support)];
                const isUnsupported = supportedBy.every(x => goneBricks.has(x));

                if (isUnsupported) {
                    goneBricks.add(support);
                    queue.push(support);
                }
            }
        }

        sum += goneBricks.size - 1;
    }

    return sum;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const bricks = parseBricks(fileContent);
    const spaceSize = getSpaceSizeFromBricks(bricks);
    const space = generate3DSpace(spaceSize);
    const filledSpace = fillSpaceWithBricks(space, bricks);
    const settledSpace = settleBricks(spaceSize, filledSpace);
    const [supportedByMap, supportsMap] = getBrickSupports(settledSpace);
    const sum = sumFallenBricks(supportedByMap, supportsMap, bricks);

    return sum
}

const solution = await solve('testCase');
console.log(solution); 