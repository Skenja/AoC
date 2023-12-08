import * as fs from 'fs/promises';

const parseHands = (lines) => {
    const hands = lines.map(line => {
        const parts = line.split(' ');
        return {
            cards: parts[0],
            bid: parseInt(parts[1])
        };
    });

    return hands;
}

const fiveOfAKindRegex = /(.)(?=\1{4})/;
const fourOfAKindRegex = /(.)(?=.*\1.*\1.*\1.*)/;
const fullHouseRegex = /((.)(?=.*\2.*\2.*)\2*((?!\2).)(?=.*\3.*).*)|((.)(?=.*\5.*)\5*((?!\5).)(?=.*\6.*\6.*).*)/;
const threeOfAKindRegex = /(.)(?=.*\1.*\1.*)/;
const twoPairRegex = /.*?(.)(?=.*\1.*).*?((?!\1.*).)(?=.*\2.*).*/;
const pairRegex = /(.)(?=.*\1.*)/;

const groupHandsByType = (hands) => {
    const fiveOfAKind = [];
    const fourOfAKind = [];
    const fullHouse = [];
    const threeOfAKind = [];
    const twoPair = [];
    const pair = [];
    const highCard = [];

    for (const hand of hands) {
        if (fiveOfAKindRegex.test(hand.cards)) {
            fiveOfAKind.push(hand);
        } else if (fourOfAKindRegex.test(hand.cards)) {
            fourOfAKind.push(hand);
        } else if (fullHouseRegex.test(hand.cards)) {
            fullHouse.push(hand);
        } else if (threeOfAKindRegex.test(hand.cards)) {
            threeOfAKind.push(hand);
        } else if (twoPairRegex.test(hand.cards)) {
            twoPair.push(hand);
        } else if (pairRegex.test(hand.cards)) {
            pair.push(hand);
        } else {
            highCard.push(hand);
        }
    }

    return [
        highCard,
        pair,
        twoPair,
        threeOfAKind,
        fullHouse,
        fourOfAKind,
        fiveOfAKind
    ];
};

const cardRank = 'AKQJT98765432';

const compareHands = (hand1, hand2) => {
    for (let i = 0; i < hand1.cards.length; i++) {
        const card1 = hand1.cards[i];
        const card2 = hand2.cards[i];
        const index1 = cardRank.indexOf(card1);
        const index2 = cardRank.indexOf(card2);

        if (index1 === index2) {
            continue;
        } else if (index1 > index2) {
            return -1;
        } else {
            return 1;
        }
    }
};

const rankHands = (groups) => {
    const results = [];

    for (const group of groups) {
        if (group.length === 1) {
            results.push(group[0]);
            continue;
        }

        results.push(...group.sort(compareHands));
    }

    return results;
};

const calculateWinnings = (rankedHands) => {
    let totalWinings = 0;

    for (let i = 0; i < rankedHands.length; i++) {
        const hand = rankedHands[i];
        totalWinings += hand.bid * (i + 1);
    }

    return totalWinings;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const hands = parseHands(lines);
    const grouppedHands = groupHandsByType(hands);
    const rankedHands = rankHands(grouppedHands);
    const totalWinings = calculateWinnings(rankedHands);

    return totalWinings;
}

const solution = await solve('testCase');
console.log(solution);