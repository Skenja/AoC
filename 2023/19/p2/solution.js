import * as fs from 'fs/promises';

const workflowRegex = /(.+)\{(.+)\}/;

const parseWorkflow = (workflowLine) => {
    const [_, name, rules] = workflowLine.match(workflowRegex);

    return [
        name,
        rules.split(',')
    ];
}

const parseWorkflows = (lines) => {
    const workflowLines = [];

    for (const line of lines) {
        if (line === '') {
            break;
        }

        workflowLines.push(line);
    }

    const workflowsArray = workflowLines.map(parseWorkflow);
    const workflows = new Map(workflowsArray);

    return workflows;
}

const ruleRegex = /(?:([xmas])([<>])(\d+):(R)?(A)?(.+)?)|(R)|(A)|(.+)/;

const splitRange = (range, operator, value) => {
    const [min, max] = range;

    const isValueInBetween = min < value && value < max; // [1, 4000] < 3000 <

    if (isValueInBetween) {
        if (operator === '<') {
            return [[min, value - 1], [value, max]]; // [1, 2999], [3000, 4000]
        }

        if (operator === '>') {
            return [[value + 1, max], [min, value]]; // [3001, 4000], [1, 3000]
        }
    }

    const isEntireRangePassing =
        (operator === '<' && max < value) // [1, 2000] < 3000
        || (operator === '>' && min > value); // [3500, 4000] > 3000

    if (isEntireRangePassing) {
        return [range, null];
    }

    const isEntireRangeFailing =
        (operator === '<' && min > value) // [3000, 4000] < 2000
        || (operator === '>' && max < value); // [1, 2000] > 3000

    if (isEntireRangeFailing) {
        return [null, range];
    }

    const isOnBottomRangeEdge = operator === '>' && min == value; // [3000, 4000] > 3000

    if (isOnBottomRangeEdge) {
        return [[value, value], range];
    }

    const isOnTopRangeEdge = operator === '<' && max == value; // [1, 4000] < 4000

    if (isOnTopRangeEdge) {
        return [range, [value, value]];
    }
}

const getNumberOfParameterVariations = (range) => {
    const [min, max] = range;

    return max - min + 1;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const workflows = parseWorkflows(lines);
    const acceptedCombinations = [];
    const queue = [
        ['in', { x: [1, 4000], m: [1, 4000], a: [1, 4000], s: [1, 4000] }]
    ];

    while (queue.length > 0) {
        let [workflowName, values] = queue.pop();
        const workflow = workflows.get(workflowName);

        for (const rule of workflow) {
            const [_, varName, operator, valueString, conditionReject, conditionAccept, conditionNextWorkflow, reject, accept, nextWorkflow] = rule.match(ruleRegex);

            if (reject) {
                break;
            }

            if (accept) {
                acceptedCombinations.push(values);
                break;
            }

            if (nextWorkflow) {
                queue.push([nextWorkflow, values]);
                break;
            }

            const value = parseInt(valueString);
            const range = values[varName];
            const [passingRange, failingRange] = splitRange(range, operator, value);

            const valuesForThisRule = {
                ...values,
                [varName]: passingRange
            };

            const valuesForNextRule = {
                ...values,
                [varName]: failingRange
            };

            values = valuesForNextRule;

            if (conditionAccept) {
                acceptedCombinations.push(valuesForThisRule);
                continue;
            }

            if (conditionNextWorkflow) {
                queue.push([conditionNextWorkflow, valuesForThisRule]);
                continue;
            }

            if (conditionReject) {
                continue;
            }
        }
    }

    // Assuming no overlapping combinations
    const distinctCombinations = acceptedCombinations
        .map(combination => {
            const xCount = getNumberOfParameterVariations(combination.x);
            const mCount = getNumberOfParameterVariations(combination.m);
            const aCount = getNumberOfParameterVariations(combination.a);
            const sCount = getNumberOfParameterVariations(combination.s);

            return xCount * mCount * aCount * sCount;
        })
        .reduce((acc, count) => acc + count, 0);

    return distinctCombinations;
}

const solution = await solve('testCase');
console.log(solution);