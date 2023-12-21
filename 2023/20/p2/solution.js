import * as fs from 'fs/promises';

const createBroadcasterModule = (outputs) => {
    return {
        process: (pulse) => pulse,
        outputs
    }
}

const createFlipFlopModule = (outputs) => {
    let isOn = false;

    return {
        process: (pulse) => {
            if (pulse === 'high') {
                return null;
            }

            isOn = !isOn;

            return isOn ? 'high' : 'low';
        },
        wasLastOutputHigh: () => isOn,
        outputs,
        isFlipFlop: true
    }
}

const createConjuctionModule = (inputs, outputs) => {
    let lastOutput = 'low';

    return {
        process: () => {
            const allInputsAreOn = inputs.every(input => input.wasLastOutputHigh());

            lastOutput = allInputsAreOn ? 'low' : 'high';

            return lastOutput;
        },
        outputs,
        wasLastOutputHigh: () => lastOutput === 'high',
    }
}

const createModules = (lines) => {
    const modulesMap = new Map();
    const inputsMap = new Map();
    const conjuctionModulesParams = [];

    for (const line of lines) {
        const [declaration, outputsString] = line.split(' -> ');
        const outputs = outputsString.split(', ');
        const name = declaration.substring(1);

        if (declaration === 'broadcaster') {
            modulesMap.set(declaration, createBroadcasterModule(outputs));
            continue;
        }

        for (const output of outputs) {
            if (!inputsMap.has(output)) {
                inputsMap.set(output, []);
            }

            inputsMap.get(output).push(name);
        }

        if (declaration[0] === '%') {
            modulesMap.set(name, createFlipFlopModule(outputs));
        } else {
            conjuctionModulesParams.push([name, outputs]);
        }
    }

    while (conjuctionModulesParams.length > 0) {
        const params = conjuctionModulesParams.shift();
        const [name, outputs] = params;
        const inputs = inputsMap.get(name).map(input => modulesMap.get(input));

        if (inputs.some(x => x === undefined)) {
            conjuctionModulesParams.push(params);
            continue;
        }

        modulesMap.set(name, createConjuctionModule(inputs, outputs));
    }

    return modulesMap;
}

const countNumberOfPulsesSent = (modules) => {
    const queue = [['broadcaster', 'low']];
    let numberOfLowPulsesToRx = 0;

    while (queue.length > 0) {
        const [moduleName, inputPulse] = queue.shift();
        const module = modules.get(moduleName);

        if (!module) {
            if (moduleName === 'rx' && inputPulse === 'low') {
                numberOfLowPulsesToRx++;
            }

            continue;
        }

        const outputPulse = module.process(inputPulse);

        if (outputPulse === null) {
            continue;
        }

        const addToQueue = module.outputs
            .filter(x => !(modules.get(x)?.isFlipFlop && outputPulse === 'high'))
            .map(x => [x, outputPulse]);

        queue.push(...addToQueue);
    }

    return numberOfLowPulsesToRx === 1;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');
    const modules = createModules(lines);

    let count = 0;

    while (!countNumberOfPulsesSent(modules)) {
        count++;
    }

    return count;
}

const solution = await solve('testCase');
console.log(solution);