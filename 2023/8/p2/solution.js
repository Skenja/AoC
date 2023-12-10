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

const calculateLCM = (numbers) => {
    const gcd = (a, b) => {
        if (b === 0) {
            return a;
        }
        return gcd(b, a % b);
    };

    const lcm = (a, b) => {
        return (a * b) / gcd(a, b);
    };

    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        result = lcm(result, numbers[i]);
    }

    return result;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const directions = lines[0];
    const nodes = lines.slice(2)
        .map(line => line.match(regex).slice(1, 4))
        .reduce((map, node) => map.set(node[0], node.slice(1)), new Map());

    const startingNodes = [...nodes.keys()]
        .filter(key => key[2] === 'A');
    const stepCounts = [];

    for (const startingNode of startingNodes) {
        let numberOfSteps = 0;
        const getNextDirection = getNavigator(directions);
        let currentNode = nodes.get(startingNode);

        while (true) {
            const nextNode = getNextDirection(currentNode);
            numberOfSteps++;

            if (nextNode[2] === 'Z') {
                break;
            }

            currentNode = nodes.get(nextNode);
        }

        stepCounts.push(numberOfSteps);
    }

    return calculateLCM(stepCounts);
}

const solution = await solve('testCase');
console.log(solution);