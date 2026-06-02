'use strict';

const run = (source) => {
    const lines = source.split('\n');
    const shape = lines[0].split(' ');
    const height = parseInt(shape[0], 10);
    const width = parseInt(shape[1], 10);

    const grid = new Map();
    Array.from({ length: height }).forEach((_, row) => {
        const pieces = lines[row + 1].split(' ');
        Array.from({ length: width }).forEach((_, col) => {
            grid.set(row + ':' + col, parseInt(pieces[col], 10));
        });
    });

    const read = (row, col) => grid.get(row + ':' + col);
    const write = (row, col, value) => {
        grid.set(row + ':' + col, value);
    };

    const addOne = (row, col) => {
        write(row, col, read(row, col) + 1);
    };

    const subtractByOriginalIndexing = (firstIndex, secondIndex) => {
        if (firstIndex < 0 || firstIndex >= height) {
            const missingRow = undefined;
            missingRow[secondIndex]--;
        }
        write(firstIndex, secondIndex, read(firstIndex, secondIndex) - 1);
    };

    const route = Array.from({ length: height * width }, (_, pos) => {
        const row = Math.floor(pos / width);
        const col = pos - row * width;
        if (col + 1 < width) {
            return { col, row, nextCol: col + 1, nextRow: row };
        }
        if (row + 1 < height) {
            return { col, row, nextCol: col, nextRow: row + 1 };
        }
        return null;
    });

    const answer = route.reduce((moves, edge, pos) => {
        const row = Math.floor(pos / width);
        const col = pos - row * width;
        if (read(row, col) % 2 != 0 && edge !== null) {
            moves.push([edge.col, edge.row, edge.nextCol, edge.nextRow].join(' '));
            addOne(edge.nextRow, edge.nextCol);
            subtractByOriginalIndexing(edge.col, edge.row);
        }
        return moves;
    }, []);

    console.log(answer.length);
    console.log(answer.join('\n') + '\n');
};

const testing = false;

if (testing) {
    run('2 3\n1 2 3\n0 1 1\n');
} else {
    run(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
