import * as fs from 'fs/promises';

const regex = /(-?\d+)/g;

const parseHailstones = (fileContent) => {
    const hailstones = fileContent
        .split('\r\n')
        .map(line => [...line.matchAll(regex)])
        .map(line => line.map(match => parseInt(match[1])))
        .map(([x, y, z, vx, vy, vz]) => ({ x, y, z, vx, vy, vz }));

    return hailstones;
}

const getLinearSolver = (hailstones) => {
    return (n, m, svx, svy, svz) => {
        const hailstone1 = hailstones[n];
        const hailstone2 = hailstones[m];
        const x0 = hailstone1.x;
        const y0 = hailstone1.y;
        const z0 = hailstone1.z;
        const x1 = hailstone2.x;
        const y1 = hailstone2.y;
        const mvx0 = svx - hailstone1.vx;
        const mvy0 = svy - hailstone1.vy;
        const mvz0 = svz - hailstone1.vz;
        const mvx1 = svx - hailstone2.vx;
        const mvy1 = svy - hailstone2.vy;
        const det = mvx1 * mvy0 - mvx0 * mvy1;

        if (det === 0) {
            return undefined;
        }

        return [
            (mvx1 * mvy0 * x0 - mvx0 * mvy1 * x1 + mvx0 * mvx1 * (-y0 + y1)) / det,
            (mvy0 * mvy1 * (x0 - x1) - mvx0 * mvy1 * y0 + mvx1 * mvy0 * y1) / det,
            (mvy1 * mvz0 * (x0 - x1) + mvx1 * mvz0 * (-y0 + y1)) / det + z0,
            (mvy1 * (-x0 + x1) + mvx1 * (y0 - y1)) / det,
            (mvy0 * (-x0 + x1) + mvx0 * (y0 - y1)) / det
        ];
    }
}

const getErrorCalculator = (linearSolve) => {
    return (svx, svy, svz) => {
        const nums1 = linearSolve(0, 1, svx, svy, svz);
        const nums2 = linearSolve(2, 1, svx, svy, svz);

        if (!nums1 || !nums2) {
            return undefined;
        }

        const dsx = nums1[0] - nums2[0];
        const dsy = nums1[1] - nums2[1];
        const dsz = nums1[2] - nums2[2];
        const dt = nums1[4] - nums2[4];

        return dsx + dsy + dsz + dt;
    };
}

const calculateRockStartingPosition = (hailstones) => {
    const linearSolve = getLinearSolver(hailstones);
    const calculateError = getErrorCalculator(linearSolve);

    let xm = 0;
    let ym = 0;
    let zm = 0;
    let minimumFound = undefined;

    for (let r = 1; r < 400; r++) {
        for (let face = 0; face < 3; face++) {
            const dx = face === 0 ? 2 * r : 1;
            const dy = face === 1 ? 2 * r : 1;
            const dz = face === 2 ? 2 * r : 1;

            for (let svx = -r; svx < r + 1; svx += dx) {
                for (let svy = -r; svy < r + 1; svy += dy) {
                    for (let svz = -r; svz < r + 1; svz += dz) {
                        const error = Math.abs(calculateError(svx, svy, svz));

                        if (isNaN(error)) {
                            continue;
                        }

                        if (minimumFound === undefined || error < minimumFound) {
                            xm = svx;
                            ym = svy;
                            zm = svz;
                            minimumFound = error;
                        }
                    }
                }
            }
        }

        if (minimumFound < 1) {
            break;
        }
    }

    const solution = linearSolve(0, 1, xm, ym, zm);

    return solution;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const hailstones = parseHailstones(fileContent);
    const [x, y, z] = calculateRockStartingPosition(hailstones);

    return x + y + z;
}

const solution = await solve('testCase');
console.log(solution);