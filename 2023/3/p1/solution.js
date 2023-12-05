import * as fs from 'fs/promises';

const checkNumberSurroundings = (number, numberIndex, lines) => {
    const numberStart = numberIndex;
    const numberEnd = numberStart + number.length;
    const start = Math.max(numberStart - 1, 0);

    const lineLength = lines[1].length;
    const charsUntilLineEnd = Math.max(lineLength - numberEnd - 1, 0);

    const regex = `.{${start}}([^.\\d]+).{${charsUntilLineEnd}}`;
    const matches = lines.map(line => line.match(regex));
    const anyMatches = matches
        .filter(match => match)
        .length > 0;

    return anyMatches;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');
    const paddedLines = ['', ...lines, ''];

    const regex = /(\d+)/g;
    const lineMatches = lines.map(line => [...line.matchAll(regex)]);

    let sum = 0;
    for (let i = 0; i < lineMatches.length; i++) {
        const linesToCheck = paddedLines.slice(i, i + 3);

        for (let j = 0; j < lineMatches[i].length; j++) {
            const number = lineMatches[i][j][1];
            const numberIndex = lineMatches[i][j].index;

            const numberMatches = checkNumberSurroundings(number, numberIndex, linesToCheck);
            if (numberMatches) {
                sum += parseInt(number);
            }
        }
    }

    return sum;
}

const solution = await solve('testCase');
console.log(solution); 