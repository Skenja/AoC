import * as fs from 'fs/promises';

const getEnergizedTileTracker = () => {
    const energizedTilesMap = new Map();

    return {
        track: (x, y) => {
            if (!energizedTilesMap.has(x)) {
                energizedTilesMap.set(x, new Set([y]));
            } else {
                const tiles = energizedTilesMap.get(x);
                tiles.add(y);
            }
        },
        getCount: () => {
            const values = [...energizedTilesMap.values()];
            const count = values.reduce((acc, curr) => acc + [...curr.values()].length, 0);

            return count;
        }
    };
}

const getIterator = (contraption, track) => {
    return (x, y, direction) => {
        const isXOutOfBounds = x < 0 || x >= contraption[0].length;
        const isYOutOfBounds = y < 0 || y >= contraption.length;

        if (isXOutOfBounds || isYOutOfBounds) {
            return null;
        }

        const currentTile = contraption[y][x];
        track(x, y);

        let result = null;

        if (currentTile === '.') {
            if (direction === 'right') {
                result = [x + 1, y, direction];
            } else if (direction === 'left') {
                result = [x - 1, y, direction];
            } else if (direction === 'up') {
                result = [x, y - 1, direction];
            } else if (direction === 'down') {
                result = [x, y + 1, direction];
            }
        } else if (currentTile === '/') {
            if (direction === 'right') {
                result = [x, y - 1, 'up'];
            } else if (direction === 'left') {
                result = [x, y + 1, 'down'];
            } else if (direction === 'up') {
                result = [x + 1, y, 'right'];
            } else if (direction === 'down') {
                result = [x - 1, y, 'left'];
            }
        } else if (currentTile === '\\') {
            if (direction === 'right') {
                result = [x, y + 1, 'down'];
            } else if (direction === 'left') {
                result = [x, y - 1, 'up'];
            } else if (direction === 'up') {
                result = [x - 1, y, 'left'];
            } else if (direction === 'down') {
                result = [x + 1, y, 'right'];
            }
        } else if (currentTile === '-') {
            if (direction === 'right') {
                result = [x + 1, y, direction];
            } else if (direction === 'left') {
                result = [x - 1, y, direction];
            } else {
                result = [[x - 1, y, 'left'], [x + 1, y, 'right']];
            }
        } else if (currentTile === '|') {
            if (direction === 'up') {
                result = [x, y - 1, direction];
            } else if (direction === 'down') {
                result = [x, y + 1, direction];
            } else {
                result = [[x, y - 1, 'up'], [x, y + 1, 'down']];
            }
        }

        return result;
    };
}

const getBeamFollower = (iterate) => {
    return (x, y, direction) => {
        while (true) {
            const nextTile = iterate(x, y, direction);

            if (nextTile === null) {
                break;
            }

            if (nextTile.length === 2) {
                return nextTile;
            }

            [x, y, direction] = nextTile;
        }

        return null;
    };
}

const stringify = (args) => {
    return args.join(',');
}

const calculateNumberOfEnergizedTiles = (contraption, x, y, direction) => {
    const { track, getCount } = getEnergizedTileTracker();
    const iterate = getIterator(contraption, track);
    const followBeam = getBeamFollower(iterate);

    const traversedPaths = new Set();
    const startingArgs = [x, y, direction];
    let pathsToFollow = [startingArgs];

    while (pathsToFollow.length > 0) {
        const newPathsToFollow = [];

        for (const path of pathsToFollow) {
            const key = stringify(path);

            if (traversedPaths.has(key)) {
                continue;
            }

            const newPaths = followBeam(...path);
            traversedPaths.add(key);

            if (newPaths) {
                newPathsToFollow.push(...newPaths);
            }
        }

        pathsToFollow = newPathsToFollow;
    }

    const result = getCount();

    return result;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const contraption = fileContent.split('\r\n').map((line) => line.split(''));
    const startingArgs = [
        ...Array.from({ length: contraption[0].length }, (_, i) => [0, i, 'right']),
        ...Array.from({ length: contraption[0].length }, (_, i) => [contraption.length - 1, i, 'left']),
        ...Array.from({ length: contraption.length }, (_, i) => [i, 0, 'down']),
        ...Array.from({ length: contraption.length }, (_, i) => [i, contraption[0].length - 1, 'up'])
    ];

    let maxNumberOfEnergizedTiles = 0;

    for (const args of startingArgs) {
        const numberOfEnergizedTiles = calculateNumberOfEnergizedTiles(contraption, ...args);

        if (numberOfEnergizedTiles > maxNumberOfEnergizedTiles) {
            maxNumberOfEnergizedTiles = numberOfEnergizedTiles;
        }
    }

    return maxNumberOfEnergizedTiles;
}

const solution = await solve('testCase');
console.log(solution);