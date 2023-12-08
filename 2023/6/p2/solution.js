import * as fs from 'fs/promises';

const regex = /\d+/g;

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

    const time = parseInt(lines[0].match(regex).join(''));
    const distance = parseInt(lines[1].match(regex).join(''));

    return calculateWinOptions(time, distance);
}

const solution = await solve('testCase');
console.log(solution);