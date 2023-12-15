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

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const instructions = fileContent.split(',');
    const result = instructions
        .map((instruction) => calculateHash(instruction))
        .reduce((acc, curr) => acc + curr, 0);

    return result;
}

const solution = await solve('testCase');
console.log(solution);