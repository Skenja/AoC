import * as fs from 'fs/promises';

const groupLinesIntoPatterns = (lines) => {
    const patterns = [];
    let currentPattern = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '') {
            patterns.push(currentPattern);
            currentPattern = [];
        } else {
            currentPattern.push(lines[i]);
        }
    }

    patterns.push(currentPattern);

    return patterns;
}

const getNumberOfSmudges = (line1, line2) => {
    let numberOfSmudges = 0;

    for (let i = 0; i < line1.length; i++) {
        if (line1[i] !== line2[i]) {
            numberOfSmudges++;
        }
    }

    return numberOfSmudges;
}

const findReflectionLines = (pattern, numberOfSmudgesCutoff) => {
    const reflectionLines = [];

    for (let i = 1; i < pattern.length; i++) {
        const numberOfSmudges = getNumberOfSmudges(pattern[i], pattern[i - 1]);

        if (numberOfSmudges <= numberOfSmudgesCutoff) {
            reflectionLines.push(i);
        }
    }

    return reflectionLines;
}

const checkReflectionLines = (pattern, reflectionLines, numberOfSmudgesCutoff) => {
    const checkedReflectionLines = [];

    for (const reflectionLine of reflectionLines) {
        let isChecked = true;
        let totalNumberOfSmudges = 0;

        for (let i = reflectionLine; i < pattern.length; i++) {
            const distanceFromReflectionLine = i - reflectionLine;
            const aboveEquivalent = reflectionLine - 1 - distanceFromReflectionLine;

            if (aboveEquivalent < 0) {
                break;
            }

            const numberOfSmudges = getNumberOfSmudges(pattern[i], pattern[aboveEquivalent]);

            if (numberOfSmudges > numberOfSmudgesCutoff) {
                isChecked = false;
                break;
            }

            totalNumberOfSmudges += numberOfSmudges;
        }

        if (isChecked && totalNumberOfSmudges === numberOfSmudgesCutoff) {
            checkedReflectionLines.push(reflectionLine);
        }
    }

    return checkedReflectionLines;
}

const findHorizontalReflectionLines = (pattern, numberOfSmudgesCutoff) => {
    const reflectionLines = findReflectionLines(pattern, numberOfSmudgesCutoff);
    const checkedReflectionLines = checkReflectionLines(pattern, reflectionLines, numberOfSmudgesCutoff);

    return checkedReflectionLines;
}

const flipPattern = (lines) => {
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

const findVerticalReflectionLines = (pattern, numberOfSmudgesCutoff) => {
    const flippedPattern = flipPattern(pattern);
    const reflectionLines = findHorizontalReflectionLines(flippedPattern, numberOfSmudgesCutoff);

    return reflectionLines;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const patterns = groupLinesIntoPatterns(lines);
    const horizontalIndices = [];
    const verticalIndices = [];
    const numberOfSmudgesCutoff = 1;

    for (const pattern of patterns) {
        const horizontalReflectionLines = findHorizontalReflectionLines(pattern, numberOfSmudgesCutoff);
        horizontalIndices.push(...horizontalReflectionLines);

        if (horizontalReflectionLines.length > 0) {
            continue;
        }

        const verticalReflectionLines = findVerticalReflectionLines(pattern, numberOfSmudgesCutoff);
        verticalIndices.push(...verticalReflectionLines);
    }

    const sumH = horizontalIndices.reduce((a, b) => a + b, 0);
    const sumV = verticalIndices.reduce((a, b) => a + b, 0);

    return sumV + 100 * sumH;
}

const solution = await solve('testCase');
console.log(solution);