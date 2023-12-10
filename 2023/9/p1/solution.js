import * as fs from 'fs/promises';

const calculateHistorySeqeuence = (history) => {
    const result = {
        sequence: [],
        isLast: true
    };

    for (let i = 1; i < history.length; i++) {
        const difference = history[i] - history[i - 1];
        result.sequence.push(difference);

        if (difference !== 0) {
            result.isLast = false;
        }
    }

    return result;
};

const calculateSequences = (history) => {
    let sequences = [history];
    let lastSequence = sequences[sequences.length - 1];
    let isLast = false;

    while (!isLast) {
        const nextSequence = calculateHistorySeqeuence(lastSequence);
        lastSequence = nextSequence.sequence;
        isLast = nextSequence.isLast;
        sequences = [lastSequence, ...sequences];
    }

    return sequences;
};

const fillNextSequenceValue = (previousequence, sequence) => {
    const lastValue = previousequence[previousequence.length - 1];
    const nextValue = lastValue + sequence[sequence.length - 1];
    return sequence.push(nextValue);
};

const calculateNextHistoryValue = (history) => {
    history[0].push(0);

    for (let i = 1; i < history.length; i++) {
        fillNextSequenceValue(history[i - 1], history[i]);
    }

    const lastSequence = history[history.length - 1];
    const lastValue = lastSequence[lastSequence.length - 1];

    return lastValue;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const histories = lines.map(line => line.split(' ').map(Number));
    const historiesWithSequences = histories.map(history => calculateSequences(history));
    const newValues = historiesWithSequences.map(x => calculateNextHistoryValue(x));
    const result = newValues.reduce((acc, value) => acc + value, 0);

    return result;
}

const solution = await solve('testCase');
console.log(solution);