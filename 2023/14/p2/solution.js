import * as fs from 'fs/promises';

const tiltBoard = (board) => {
    const newBoard = Array.from({ length: board.length }, () => []);

    for (let x = 0; x < board[0].length; x++) {
        let lastFullSpace = -1;

        for (let y = 0; y < board.length; y++) {
            if (board[y][x] === '#') {
                lastFullSpace = y;
                newBoard[y][x] = board[y][x]
                continue;
            }

            if (board[y][x] === 'O') {
                newBoard[lastFullSpace + 1][x] = board[y][x];
                lastFullSpace = lastFullSpace + 1;

                if (y !== lastFullSpace) {
                    newBoard[y][x] = '.';
                }
            }

            if (board[y][x] === '.') {
                newBoard[y][x] = '.';
            }
        }
    }

    return newBoard;
}

const rotateBoard = (board) => {
    const newBoard = Array.from({ length: board.length }, () => []);

    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[0].length; x++) {
            newBoard[y][x] = board[board.length - 1 - x][y];
        }
    }

    return newBoard;
}

const cycleMap = new Map();

const cycleBoard = (originalBoard, numberOfCycles) => {
    let board = originalBoard;

    for (let cycle = 1; cycle <= numberOfCycles; cycle++) {
        for (let i = 0; i < 4; i++) {
            board = tiltBoard(board);
            board = rotateBoard(board);
        }

        const key = board.map(x => x.join('')).join('');
        const startOfPattern = cycleMap.get(key);

        if (startOfPattern) {
            const patternLength = cycle - startOfPattern;
            const remainingCycles = (numberOfCycles - cycle) % patternLength;

            return cycleBoard(board, remainingCycles);
        } else {
            cycleMap.set(key, cycle);
        }
    }

    return board;
}

const calculateLoadOnNorthBeam = (board) => {
    const maxLoad = board.length;
    let totalLoad = 0;

    for (let x = 0; x < board[0].length; x++) {
        for (let y = 0; y < board.length; y++) {
            if (board[y][x] === 'O') {
                totalLoad += maxLoad - y;
            }
        }
    }

    return totalLoad;
};

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const lines = fileContent.split('\r\n');
    const board = lines.map((line) => line.split(''));

    const boardAfterCycling = cycleBoard(board, 1_000_000_000);
    const totalLoad = calculateLoadOnNorthBeam(boardAfterCycling);

    return totalLoad;
}

const solution = await solve('testCase');
console.log(solution);