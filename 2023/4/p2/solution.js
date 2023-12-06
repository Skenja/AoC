import * as fs from 'fs/promises';

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const regex = /(\b\d+\b)(?=.*\|.*\b\1\b.*)/g;
    const cards = lines
        .map(line => line.substring(line.indexOf(':')))
        .map(line => line.match(regex))
        .map(lineMatches => lineMatches?.length || 0);
    const copies = Array.from({ length: cards.length }, () => 1);

    for (let i = 0; i < cards.length; i++) {
        for (let j = 1; j <= cards[i]; j++) {
            copies[i + j] += copies[i];
        }
    }

    return copies.reduce((acc, curr) => acc + curr, 0);
}

const solution = await solve('testCase');
console.log(solution);