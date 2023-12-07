import * as fs from 'fs/promises';

const regex = /(\b\d+\b)/g;

const parseSeedRanges = (lines) => {
    const seedNumbers = lines[0].match(regex).map(Number);
    const seedRanges = [];

    for (let i = 0; i <= seedNumbers.length / 2 - 1; i++) {
        const range = { s: seedNumbers[i * 2], r: seedNumbers[i * 2 + 1] };
        seedRanges.push(range);
    }

    return seedRanges;
}

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

    const seedRanges = parseSeedRanges(lines);
    const maps = parseMaps(lines);

    const transformedSeedRanges = [];

    for (let i = 0; i < seedRanges.length; i++) {
        let ranges = [seedRanges[i]];

        for (let j = 0; j < maps.length; j++) {
            const map = maps[j];
            const rangesTouchedByMap = [];

            for (let k = 0; k < map.length; k++) {
                const mapLine = map[k];
                const rangesUntouchedByLine = [];

                for (const range of ranges) {
                    const rangeStart = range.s;
                    const rangeEnd = range.s + range.r - 1;
                    const mapStart = mapLine.s;
                    const mapEnd = mapLine.s + mapLine.r - 1;
                    const adjustment = mapLine.d - mapStart;

                    if (rangeStart < mapStart && rangeEnd > mapStart && rangeEnd <= mapEnd) {
                        rangesTouchedByMap.push({
                            s: rangeStart,
                            r: mapStart - rangeStart
                        });

                        rangesTouchedByMap.push({
                            s: mapStart + adjustment,
                            r: rangeEnd - mapStart + 1
                        });

                        continue;
                    }

                    if (rangeStart < mapStart && rangeEnd > mapEnd) {
                        rangesTouchedByMap.push({
                            s: rangeStart,
                            r: mapStart - rangeStart
                        });

                        rangesTouchedByMap.push({
                            s: mapStart + adjustment,
                            r: mapEnd - mapStart + 1
                        });

                        rangesTouchedByMap.push({
                            s: mapEnd + 1,
                            r: rangeEnd - mapEnd
                        });

                        continue;
                    }

                    if (mapStart <= rangeStart && rangeEnd <= mapEnd) {
                        rangesTouchedByMap.push({
                            s: rangeStart + adjustment,
                            r: range.r
                        });

                        continue;
                    }

                    if (mapStart <= rangeStart && mapEnd < rangeEnd && mapEnd >= rangeStart) {
                        rangesTouchedByMap.push({
                            s: rangeStart + adjustment,
                            r: mapEnd - rangeStart
                        });

                        rangesTouchedByMap.push({
                            s: mapEnd + 1,
                            r: rangeEnd - mapEnd + 1
                        });

                        continue;
                    }

                    rangesUntouchedByLine.push(range);
                }

                ranges = rangesUntouchedByLine;
            }

            ranges.push(...rangesTouchedByMap);
        }

        transformedSeedRanges.push(...ranges);
    }

    const closestLocation = transformedSeedRanges.reduce((acc, curr) => acc > curr.s ? curr.s : acc, Infinity);

    return closestLocation;
}

const solution = await solve('testCase');
console.log(solution);