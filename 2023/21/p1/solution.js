import * as fs from 'fs/promises';

const createPriorityQueue = () => {
    const queue = [];

    const enqueue = (element, priority) => {
        queue.push({ element, priority });
        sort();
    };

    const dequeue = () => {
        if (isEmpty()) {
            return null;
        }
        return queue.shift();
    };

    const sort = () => {
        queue.sort((a, b) => a.priority - b.priority);
    };

    const isEmpty = () => {
        return queue.length === 0;
    };

    return {
        enqueue,
        dequeue,
        isEmpty
    };
};

// Helper function to get the neighbors of a vertex
const getNeighbors = (vertex, rows, cols) => {
    const [row, col] = vertex;
    const neighbors = [];

    if (row > 0) neighbors.push([row - 1, col]); // Up
    if (row < rows - 1) neighbors.push([row + 1, col]); // Down
    if (col > 0) neighbors.push([row, col - 1]); // Left
    if (col < cols - 1) neighbors.push([row, col + 1]); // Right

    return neighbors;
};

const dijkstra = (matrix, start) => {
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Create a 2D array to store the distances
    const distances = Array(rows)
        .fill()
        .map(() => Array(cols).fill(Infinity));

    // Create a priority queue to store the vertices
    const queue = createPriorityQueue();

    // Set the distance of the start vertex to 0
    distances[start[0]][start[1]] = 0;

    // Enqueue the start vertex with distance 0
    queue.enqueue(start, 0);

    while (!queue.isEmpty()) {
        const { vertex, distance } = queue.dequeue();

        // Get the neighbors of the current vertex
        const neighbors = getNeighbors(vertex, rows, cols);

        for (const neighbor of neighbors) {
            const [row, col] = neighbor;
            const newDistance = distance + 1;

            if (newDistance > 64)
                continue;

            // Update the distance if it's shorter than the current distance
            if (newDistance < distances[row][col]) {
                distances[row][col] = newDistance;
                queue.enqueue(neighbor, newDistance);
            }
        }
    }

    // If we couldn't reach the end vertex
    return -1;
};

// // Example usage
// const matrix = [
//     [1, 2, 3],
//     [4, 5, 6],
//     [7, 8, 9],
// ];
// const start = [0, 0];
// const end = [2, 2];

// const shortestDistance = dijkstra(matrix, start, end);
// console.log(shortestDistance);

const findS = (matrix) => {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[0].length; x++) {
            if (matrix[y][x] === 'S') {
                return [x, y];
            }
        }
    }
}

const solve = async (fileName) => {
    const fileContent = await fs.readFile(fileName, { encoding: 'utf8' });
    const matrix = fileContent
        .split('\r\n')
        .map((line) => line.split(''));
    const startPosition = findS(matrix);
    const numberOfGardenPlots = dijkstra(matrix, startPosition)

    return startPosition;
}

const solution = await solve('testCase');
console.log(solution); 