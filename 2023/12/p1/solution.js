import * as fs from 'fs/promises';

const parseSpringRows = (lines) => {
    const springRows = lines
        .map((line) => line.split(' '))
        .map((parts) => {
            return {
                record: parts[0],
                brokenGroups: parts[1].split(',').map(Number)
            }
        });

    return springRows;
};

const generateOptions = (record) => {
    const index = record.indexOf('?');

    if (index === -1) {
        return record;
    }

    const options = [
        record.substring(0, index) + '.' + record.substring(index + 1),
        record.substring(0, index) + '#' + record.substring(index + 1),
    ];

    return options.flatMap((option) => generateOptions(option));
};

const regex = /(#+)/g;

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const springRows = parseSpringRows(lines);
    const result = springRows
        .map(row => ({ ...row, options: generateOptions(row.record) }))
        .map(row => row.options
            .map(option => [...option.matchAll(regex)])
            .filter(matches => matches.length === row.brokenGroups.length)
            .map(matches => matches.map(match => match[1]))
            .filter(matches => matches.every((match, index) => match.length === row.brokenGroups[index]))
            .reduce((acc) => acc + 1, 0)
        )
        .reduce((acc, x) => acc + x, 0);

    return result;
}

const solution = await solve('testCase');
console.log(solution);