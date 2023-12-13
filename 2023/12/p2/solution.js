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

const unfoldSpringRow = (springRow) => {
    const array = Array.from({ length: 5 });

    const unfoldSpringRows = {
        record: array.map(_ => springRow.record).join('?'),
        brokenGroups: array.map(_ => springRow.brokenGroups).flatMap(x => x)
    };

    return unfoldSpringRows;
}

const memoize = (func) => {
    const stored = new Map();

    return (...args) => {
        const k = JSON.stringify(args);
        if (stored.has(k)) {
            return stored.get(k);
        }
        const result = func(...args);
        stored.set(k, result);
        return result;
    };
}

const generateOptions = memoize((record, brokenGroups) => {
    if (record.length === 0) {
        if (brokenGroups.length === 0) {
            return 1;
        }

        return 0;
    }

    if (brokenGroups.length === 0) {
        if (record.indexOf("#") !== -1) {
            return 0;
        }

        return 1;
    }

    const sum = brokenGroups.reduce((acc, run) => acc + run, 0);

    if (record.length < sum + brokenGroups.length - 1) {
        // The record is not long enough for all broken groups
        return 0;
    }

    if (record[0] === ".") {
        return generateOptions(record.slice(1), brokenGroups);
    }

    if (record[0] === "#") {
        const [brokenGroup, ...leftoverBrokenGroups] = brokenGroups;
        for (let i = 0; i < brokenGroup; i++) {
            if (record[i] === ".") {
                return 0;
            }
        }

        if (record[brokenGroup] === "#") {
            return 0;
        }

        return generateOptions(record.slice(brokenGroup + 1), leftoverBrokenGroups);
    }

    return generateOptions("#" + record.slice(1), brokenGroups) + generateOptions("." + record.slice(1), brokenGroups);
});

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const springRows = parseSpringRows(lines);

    let sum = 0;

    for (let i = 0; i < springRows.length; i++) {
        console.log(i);
        const springRow = springRows[i];
        const row = unfoldSpringRow(springRow);
        const result = generateOptions(row.record, row.brokenGroups);

        sum += result;
    }

    return sum;
};

const solution = await solve('testCase');
console.log(solution);