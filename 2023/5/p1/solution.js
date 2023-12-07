import * as fs from 'fs/promises';

const regex = /(\b\d+\b)/g;

const parseMaps = (lines) => {
    const mapLines = lines.slice(3).filter(line => line);
    const maps = [];
    let currentMap = [];

    for (let i = 0; i < mapLines.length; i++) {
        const line = mapLines[i]

        if (line[line.length - 1] === ':') {
            maps.push(currentMap);
            currentMap = [];
            continue;
        }

        const values = line.match(regex).map(Number);
        currentMap.push({
            d: values[0],
            s: values[1],
            r: values[2]
        });
    }

    maps.push(currentMap);

    return maps;
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');

    const seeds = lines[0].match(regex).map(Number);
    const maps = parseMaps(lines);
    const locations = [];

    for (let i = 0; i < seeds.length; i++) {
        let value = seeds[i];

        for (let j = 0; j < maps.length; j++) {
            const map = maps[j];

            for (let k = 0; k < map.length; k++) {
                const { d, s, r } = map[k];

                if (value >= s && value < s + r) {
                    value = value + (d - s);
                    break;
                }
            }
        }

        locations.push(value);
    }

    const closestLocation = locations.reduce((acc, curr) => acc > curr ? curr : acc, Infinity);

    return closestLocation;
}

const solution = await solve('testCase');
console.log(solution);