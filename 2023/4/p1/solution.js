import * as fs from 'fs/promises';

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const regex = /(\b\d+\b)(?=.*\|.*\b\1\b.*)/g;
    const result = lines
        .map(line => line.substring(line.indexOf(':')))
        .map(line => line.match(regex))
        .filter(lineMatches => lineMatches)
        .map(lineMatches => Math.pow(2, lineMatches.length - 1))
        .reduce((acc, curr) => acc + curr, 0);

    return result;
}

const solution = await solve('testCase');
console.log(solution);

