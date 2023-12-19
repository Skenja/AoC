import * as fs from 'fs/promises';

const separate = (lines) => {
    const workflows = [];
    const parts = [];
    let currentArray = workflows;

    for (const line of lines) {
        if (line === '') {
            currentArray = parts;
            continue;
        }

        currentArray.push(line);
    }

    return [workflows, parts];
}

const workflowRegex = /(.+)\{(.+)\}/;

const parseWorkflow = (workflowLine) => {
    const [_, name, rules] = workflowLine.match(workflowRegex);

    return [
        name,
        rules.split(',')
    ];
}

const partRegex = /(\d+)/g;

const parsePart = (partLine) => {
    const [x, m, a, s] = [...partLine.match(partRegex)].map(Number);

    return {
        x,
        m,
        a,
        s
    };
}

const getNextStepProcessor = (acceptedParts, workflows, next) => {
    return (part, rule) => {
        if (rule === 'A') {
            acceptedParts.push(part);
            return false;
        }

        if (rule === 'R') {
            return false;
        }

        if (workflows.has(rule)) {
            next.push(workflows.get(rule));
            return false;
        }

        return true;
    }
}

const firstWorkflowName = 'in';

const ruleRegex = /([xmas])([<>])(\d+):(.+)/;

const processParts = (parts, workflows) => {
    const acceptedParts = [];

    for (const part of parts) {
        const next = [workflows.get(firstWorkflowName)];
        const getNextStep = getNextStepProcessor(acceptedParts, workflows, next);

        while (next.length > 0) {
            const nextWorkflow = next.pop();

            for (const rule of nextWorkflow) {
                const shouldContinueProcessing = getNextStep(part, rule);

                if (!shouldContinueProcessing) {
                    break;
                }

                const [_, variable, operator, valueString, nextStep] = rule.match(ruleRegex);
                const value = parseInt(valueString);
                const variableValue = part[variable];
                const ruleConditionSatisfied =
                    (operator === '>' && variableValue > value)
                    || (operator === '<' && variableValue < value);

                if (ruleConditionSatisfied) {
                    const shouldContinueProcessing2 = getNextStep(part, nextStep);

                    if (!shouldContinueProcessing2) {
                        break;
                    }
                }
            }
        }
    }

    return acceptedParts;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const [workflowLines, partLines] = separate(lines);
    const workflowsArray = workflowLines.map(parseWorkflow);
    const workflows = new Map(workflowsArray);
    const parts = partLines.map(parsePart);
    const processedParts = processParts(parts, workflows);
    const sum = processedParts.reduce((acc, part) => acc + part.x + part.m + part.a + part.s, 0);

    return sum;
}

const solution = await solve('testCase');
console.log(solution);