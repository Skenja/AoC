import * as fs from 'fs/promises';

const regex = /\b([a-z]+?):?\b/g;

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const connections = fileContent
        .split('\r\n')
        .map(line => [...line.matchAll(regex)])
        .map(matches => matches.map(match => match[1]))
        .map(([component, ...connectedComponents]) => ([component, connectedComponents]));

    // https://en.wikipedia.org/wiki/Minimum_cut
    // https://en.wikipedia.org/wiki/Karger%27s_algorithm

    return connections;
}

const solution = await solve('testCase');
console.log(solution); 