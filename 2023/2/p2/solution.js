import * as fs from 'fs/promises';

const parseGames = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\n');
    const games = lines.map(line => {
        const gameIdRegex = /Game (\d+): (.*)/;
        const matches = line.match(gameIdRegex);
        const gameId = parseInt(matches[1]);
        const gameRecord = matches[2];

        const setsRegex = /(\d+) (\w+)(;)?/g;
        const setsMatches = [...gameRecord.matchAll(setsRegex)];
        const sets = [];
        let set = new Map();

        for (const match of setsMatches) {
            const amount = parseInt(match[1]);
            const color = match[2];
            set.set(color, amount);
            if (match[3] === ';') {
                sets.push(set);
                set = new Map();
            }
        }

        sets.push(set);
        set = new Map();

        return {
            id: gameId,
            sets: sets
        };
    });

    return games;
}

const calculateMinRequirements = (games) => {
    const minRequirements = games.map(game => {
        const gameMinRequirements = new Map();
        for (const set of game.sets) {
            for (const [color, amount] of set) {
                const minAmount = gameMinRequirements.get(color);
                if (minAmount === undefined || amount > minAmount) {
                    gameMinRequirements.set(color, amount);
                }
            }
        }

        return gameMinRequirements;
    });

    return minRequirements;
}

const solve = async (fileName) => {
    const games = await parseGames(fileName);
    const minRequirements = calculateMinRequirements(games);
    const result = minRequirements.reduce((acc, minRequirements) => acc + ([...minRequirements.values()].reduce((acc1, value) => acc1 * value, 1)), 0);

    return result;
}

const solution = await solve('testCase');
console.log(solution); 