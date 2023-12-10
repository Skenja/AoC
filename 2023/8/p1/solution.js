import * as fs from 'fs/promises';

const regex = /(.{3}) = \((.{3}), (.{3})\)/;

const getNavigator = (directions) => {
    let directionsIndex = 0;

    const getNextDirection = (intersection) => {
        const direction = directions[directionsIndex];

        directionsIndex++;
        if (directionsIndex === directions.length) {
            directionsIndex = 0;
        }

        if (direction === 'L') {
            return intersection[0];
        } else {
            return intersection[1];
        }
    };

    return getNextDirection;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const directions = lines[0];
    const nodeLines = lines.slice(2)
        .map(line => line.match(regex).slice(1, 4));
    const nodes = nodeLines
        .reduce((map, node) => map.set(node[0], node.slice(1)), new Map());
    const firstNode = 'AAA';
    const lastNode = 'ZZZ';

    let numberOfSteps = 0;
    const getNextDirection = getNavigator(directions);
    let currentNode = nodes.get(firstNode);

    while (true) {
        const nextNode = getNextDirection(currentNode);
        numberOfSteps++;
        if (nextNode === lastNode) {
            break;
        }

        currentNode = nodes.get(nextNode);
    }

    return numberOfSteps;
}

const solution = await solve('testCase');
console.log(solution);