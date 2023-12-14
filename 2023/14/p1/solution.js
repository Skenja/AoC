import * as fs from 'fs/promises';

const flipLines = (lines) => {
    const newRows = [];

    for (let x = 0; x < lines[0].length; x++) {
        let newRow = '';

        for (let y = 0; y < lines.length; y++) {
            newRow += lines[y].charAt(x);
        }

        newRows.push(newRow);
    }

    return newRows;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const flippedLines = flipLines(lines);
    const maxLoad = flippedLines[0].length;
    let totalLoad = 0;

    for (const column of flippedLines) {
        let currentMaxLoad = maxLoad;

        for (let i = 0; i < column.length; i++) {
            if (column[i] === 'O') {
                totalLoad += currentMaxLoad;
                currentMaxLoad--;
            }

            if (column[i] === '#') {
                currentMaxLoad = maxLoad - i - 1;
            }
        }
    }

    return totalLoad;
}

const solution = await solve('testCase');
console.log(solution);