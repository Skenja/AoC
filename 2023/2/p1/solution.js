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
            raw: gameRecord,
            sets: sets
        };
    });

    return games;
}

const solve = async (fileName, setForComparison) => {
    const games = await parseGames(fileName);
    const possibleGames = games.filter(game => {
        const impossibleSets = game.sets.filter(set => {
            for (const [color, amount] of set) {
                const maxAmount = setForComparison.get(color);
                if (maxAmount === undefined) {
                    return true;
                }

                if (amount > maxAmount) {
                    return true;
                }
            }
            return false;
        });
        return impossibleSets.length === 0;
    });
    const sumOfPossibleGameIds = possibleGames.reduce((sum, game) => sum + game.id, 0);

    return sumOfPossibleGameIds;
}

const solution = await solve('testCase', new Map([
    ['red', 12],
    ['green', 13],
    ['blue', 14]
]));
console.log(solution); 