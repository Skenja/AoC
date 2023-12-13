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

const findReflectionLines = (pattern) => {
    const reflectionLines = [];

    for (let i = 1; i < pattern.length; i++) {
        if (pattern[i] === pattern[i - 1]) {
            reflectionLines.push(i);
        }
    }

    return reflectionLines;
}

const checkReflectionLines = (pattern, reflectionLines) => {
    const checkedReflectionLines = [];

    for (const reflectionLine of reflectionLines) {
        let isChecked = true;

        for (let i = reflectionLine + 1; i < pattern.length; i++) {
            const distanceFromReflectionLine = i - reflectionLine;
            const leftEquivalent = reflectionLine - 1 - distanceFromReflectionLine;

            if (leftEquivalent < 0) {
                break;
            }

            if (pattern[i] !== pattern[leftEquivalent]) {
                isChecked = false;
                break;
            }
        }

        if (isChecked) {
            checkedReflectionLines.push(reflectionLine);
        }
    }

    return checkedReflectionLines;
}

const findHorizontalReflectionLines = (pattern) => {
    const reflectionLines = findReflectionLines(pattern);
    const checkedReflectionLines = checkReflectionLines(pattern, reflectionLines);

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

const findVerticalReflectionLines = (pattern) => {
    const flippedPattern = flipPattern(pattern);
    const reflectionLines = findHorizontalReflectionLines(flippedPattern);
    const checkedReflectionLines = checkReflectionLines(flippedPattern, reflectionLines);

    return checkedReflectionLines;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const patterns = groupLinesIntoPatterns(lines);
    const horizontalIndices = [];
    const verticalIndices = [];

    for (const pattern of patterns) {
        const horizontalReflectionLines = findHorizontalReflectionLines(pattern);
        horizontalIndices.push(...horizontalReflectionLines);

        const verticalReflectionLines = findVerticalReflectionLines(pattern);
        verticalIndices.push(...verticalReflectionLines);
    }

    const sumH = horizontalIndices.reduce((a, b) => a + b, 0);
    const sumV = verticalIndices.reduce((a, b) => a + b, 0);

    return sumV + 100 * sumH;
}

const solution = await solve('testCase');
console.log(solution);