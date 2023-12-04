import * as fs from 'fs/promises';

const spelledOutNumbersMap = new Map([
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9]
]);

const spelledOutNumbers = [...spelledOutNumbersMap.keys()];

const checkForSpelledOutNumber = (line, offset, direction) => {
  const spelledOutNumber = spelledOutNumbers.find((number) => {
    const numberOffset = direction === 1 ? 0 : number.length - 1;

    for (let i = 0; i < number.length; i++) {
      // Going forwards:
      // abcone2threexyz     one
      //    ^                ^         
      // abcone2threexyz     one
      //     ^                ^      
      // abcone2threexyz     one
      //      ^                ^      
      // Going backwards:
      // abcone2threexyz     three
      //            ^            ^
      // abcone2threexyz     three
      //           ^            ^
      // abcone2threexyz     three
      //          ^            ^
      // abcone2threexyz     three
      //         ^            ^
      // abcone2threexyz     three
      //        ^            ^
      // If any of the characters don't match, it is guaranteed not to be a match
      // If we didn't return false, it means that all characters matched, and so the number is a match
      const lineIndex = offset + i * direction;
      const numberIndex = numberOffset + i * direction;

      if (line[lineIndex] !== number[numberIndex])
        return false;
    }

    return true;
  });

  return spelledOutNumbersMap.get(spelledOutNumber) || NaN;
}

const solve = async (fileName) => {
  const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
  const lines = fileContent.split('\n');

  let sum = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let firstDigit = NaN;
    let secondDigit = NaN;

    for (let j = 0; j < line.length; j++) {
      if (isNaN(firstDigit)) {
        firstDigit = parseInt(line[j]);

        if (isNaN(firstDigit)) {
          firstDigit = checkForSpelledOutNumber(line, j, 1);
        }
      }

      if (isNaN(secondDigit)) {
        const index = line.length - 1 - j;
        secondDigit = parseInt(line[index]);

        if (isNaN(secondDigit)) {
          secondDigit = checkForSpelledOutNumber(line, index, -1);
        }
      }
    }

    sum += firstDigit * 10 + secondDigit;
  }

  return sum;
}

const solution = await solve('./testCase')
console.log(solution);