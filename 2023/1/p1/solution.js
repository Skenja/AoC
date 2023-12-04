import * as fs from 'fs/promises';

const solve = async (fileName) => {
  const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
  const lines = fileContent.split('\n');

  let sum = 0;
  for (let i = 0; i < lines.length; i++) {
    let firstDigit = NaN;
    let secondDigit = NaN;
    const line = lines[i];

    for (let j = 0; j < line.length; j++) {
      if (isNaN(firstDigit)) {
        firstDigit = parseInt(line[j]);
      }

      if (isNaN(secondDigit)) {
        secondDigit = parseInt(line[line.length - 1 - j]);
      }
    }

    sum += firstDigit * 10 + secondDigit;
  }

  return sum;
}

const solution = await solve('./testCase')
console.log(solution);