import * as fs from 'fs/promises';

const getGearRatio = (gearIndex, lines) => {
    const start = Math.max(0, gearIndex - 1);
    const end = Math.min(gearIndex + 1, lines[1].length - 1);

    const regex = /(\d+)/g;
    const matches = lines.map(line => [...line.matchAll(regex)]).flat();
    const numbersInContactWithGear = matches.filter(x => !(x.index > end || x.index + x[0].length - 1 < start));

    if (numbersInContactWithGear.length !== 2) {
        return 0;
    }

    return parseInt(numbersInContactWithGear[0][1]) * parseInt(numbersInContactWithGear[1][1]);
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');
    const paddedLines = ['', ...lines, ''];

    const regex = /(\*)/g;
    const lineMatches = lines.map(line => [...line.matchAll(regex)]);

    let sum = 0;
    for (let i = 0; i < lineMatches.length; i++) {
        const linesToCheck = paddedLines.slice(i, i + 3);

        for (let j = 0; j < lineMatches[i].length; j++) {
            const gearIndex = lineMatches[i][j].index;
            const gearRatio = getGearRatio(gearIndex, linesToCheck);

            sum += gearRatio;
        }
    }

    return sum;
}

const solution = await solve('testCase');
console.log(solution); 