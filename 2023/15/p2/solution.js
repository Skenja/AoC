import * as fs from 'fs/promises';

const addCharacterToHash = (currentValue, nextCharacter) => {
    const characterASCII = nextCharacter.charCodeAt(0);
    const newCurrentValue = (currentValue + characterASCII) * 17;
    const newNormalizedCurrentValue = newCurrentValue % 256;

    return newNormalizedCurrentValue;
}

const calculateHash = (text) => {
    let currentValue = 0;

    for (let i = 0; i < text.length; i++) {
        currentValue = addCharacterToHash(currentValue, text[i]);
    }

    return currentValue;
}

const regex = /(.+)([-=])(.*)/;

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });

    const boxes = Array.from({ length: 256 }, () => []);
    const instructions = fileContent
        .split(',')
        .map(instruction => instruction.match(regex).slice(1, 4))
        .map(instruction => ({ box: calculateHash(instruction[0]), instruction }));

    for (const instruction of instructions) {
        const operation = instruction.instruction[1];

        if (operation === '-') {
            boxes[instruction.box] = boxes[instruction.box]
                .filter(lens => lens.label !== instruction.instruction[0]);
        } else if (operation === '=') {
            const existingLens = boxes[instruction.box]
                .find(lens => lens.label === instruction.instruction[0]);

            if (existingLens) {
                existingLens.focalLength = instruction.instruction[2];
            } else {
                boxes[instruction.box].push({
                    label: instruction.instruction[0],
                    focalLength: instruction.instruction[2]
                });
            }
        }
    }

    return boxes
        .flatMap((box, boxIndex) => box
            .map((lens, lensIndex) => (boxIndex + 1) * (lensIndex + 1) * lens.focalLength))
        .reduce((acc, curr) => acc + curr, 0);
}

const solution = await solve('testCase');
console.log(solution);