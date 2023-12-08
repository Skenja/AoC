import * as fs from 'fs/promises';

const regex = /\d+/g;

const checkStrategyAgainstRecord = (totalTime, buttonReleaseTime, record) => {
    const travelTime = totalTime - buttonReleaseTime;
    const distance = travelTime * buttonReleaseTime;
    return distance > record;
}

const binarySearch = (time, record) => {
    // Assuming that it is always possible to break the record
    // Strategy where the button is held for exactly half the time results in furthest distance traveled
    // Thus, starting point is half the time
    let lowerBoundary = Math.ceil(time * 0.5);
    let nextValue = Math.ceil(lowerBoundary * 0.5);
    let step = Math.ceil(nextValue * 0.5);

    while (true) {
        const isRecordBroken = checkStrategyAgainstRecord(time, nextValue, record);
        if (isRecordBroken) {
            lowerBoundary = nextValue;
            nextValue = nextValue - step;
            step = Math.floor((step + 1) * 0.5);
        } else {
            nextValue = nextValue + step;
            step = Math.floor((step - 1) * 0.5);
        }

        if (step === 0)
            break;
    }

    return lowerBoundary;
}

const linearSearch = (time, record) => {
    let lowerBoundary = -1;

    for (let buttonReleaseTime = 1; buttonReleaseTime < time / 2; buttonReleaseTime++) {
        const isWinningStrategy = checkStrategyAgainstRecord(time, buttonReleaseTime, record);

        if (isWinningStrategy) {
            lowerBoundary = buttonReleaseTime;
            break;
        }
    }

    return lowerBoundary;
}

const calculateWinOptions = (time, record) => {
    const binarySearchTimeComplexity = Math.log2(time);
    const linearSearchTimeComplexity = time / 2 - 1;
    let lowerBoundary = null;

    if (binarySearchTimeComplexity > linearSearchTimeComplexity) {
        lowerBoundary = linearSearch(time, record)
    } else {
        lowerBoundary = binarySearch(time, record);
    }

    return time - (lowerBoundary * 2) + 1;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const time = parseInt(lines[0].match(regex).join(''));
    const distance = parseInt(lines[1].match(regex).join(''));

    return calculateWinOptions(time, distance);
}

const solution = await solve('testCase');
console.log(solution);