import * as fs from 'fs/promises';

const regex = /(\d+),(\d+),(\d+)~(\d+),(\d+),(\d+)/;

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
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

    const spaceSize = bricks.reduce((acc, brick) => ({
        x: Math.max(acc.x, brick.x2 + 1),
        y: Math.max(acc.y, brick.y2 + 1),
        z: Math.max(acc.z, brick.z2 + 1)
    }), { x: 0, y: 0, z: 0 });

    const space = Array.from({ length: spaceSize.z }, () =>
        Array.from({ length: spaceSize.y }, () =>
            Array(spaceSize.x).fill(null)
        ));

    for (const brick of bricks) {
        for (let z = brick.z1; z <= brick.z2; z++) {
            for (let y = brick.y1; y <= brick.y2; y++) {
                for (let x = brick.x1; x <= brick.x2; x++) {
                    space[z][y][x] = brick.i;
                }
            }
        }
    }

    return space
}

const solution = await solve('testCase');
console.log(solution); 