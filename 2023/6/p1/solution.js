import * as fs from 'fs/promises';

const regex = /\b(\d+)\b/g;

const checkStrategyAgainstRecord = (totalTime, buttonReleaseTime, record) => {
    const travelTime = totalTime - buttonReleaseTime;
    const distance = travelTime * buttonReleaseTime;
    return distance > record;
}

const calculateWinOptions = (time, record) => {
    let winningStrategies = 0;

    for (let buttonReleaseTime = 1; buttonReleaseTime < time; buttonReleaseTime++) {
        const isWinningStrategy = checkStrategyAgainstRecord(time, buttonReleaseTime, record);

        if (isWinningStrategy)
            winningStrategies++;
    }

    return winningStrategies;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const times = lines[0].match(regex).map(Number);
    const distances = lines[1].match(regex).map(Number);

    let totalWinOptions = 1;

    for (let i = 0; i < times.length; i++) {
        const winOptions = calculateWinOptions(times[i], distances[i]);
        totalWinOptions *= winOptions;
    }

    return totalWinOptions;
}

const solution = await solve('testCase');
console.log(solution);