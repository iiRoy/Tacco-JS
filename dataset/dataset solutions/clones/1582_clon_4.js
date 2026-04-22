function Pathfinder(dataString) {
    const inputLines = dataString.split('\n');

    const parseCoordinates = (line) => line.split(' ').map(Number);

    const [gridHeight, gridWidth] = parseCoordinates(inputLines[0]);
    const [startRow, startCol] = parseCoordinates(inputLines[1]).map(val => val - 1);
    const [endRow, endCol] = parseCoordinates(inputLines[2]).map(val => val - 1);

    const mazeGrid = inputLines.slice(3, 3 + gridHeight).map(rowStr => rowStr.split(''));

    const minCosts = new Map();
    
    const getCellKey = (r, c) => `${r},${c}`;

    const heap = [];
    const heapPush = (item) => {
        heap.push(item);
        let currentIdx = heap.length - 1;
        while (currentIdx > 0) {
            let parentIdx = Math.floor((currentIdx - 1) / 2);
            if (heap[currentIdx][0] < heap[parentIdx][0]) {
                [heap[currentIdx], heap[parentIdx]] = [heap[parentIdx], heap[currentIdx]];
                currentIdx = parentIdx;
            } else {
                break;
            }
        }
    };
    const heapPop = () => {
        if (heap.length === 0) return undefined;
        if (heap.length === 1) return heap.pop();

        const item = heap[0];
        heap[0] = heap.pop();
        let currentIdx = 0;
        const lastIdx = heap.length - 1;

        while (true) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let smallestChildIdx = currentIdx;

            if (leftChildIdx <= lastIdx && heap[leftChildIdx][0] < heap[smallestChildIdx][0]) {
                smallestChildIdx = leftChildIdx;
            }
            if (rightChildIdx <= lastIdx && heap[rightChildIdx][0] < heap[smallestChildIdx][0]) {
                smallestChildIdx = rightChildIdx;
            }

            if (smallestChildIdx !== currentIdx) {
                [heap[currentIdx], heap[smallestChildIdx]] = [heap[smallestChildIdx], heap[currentIdx]];
                currentIdx = smallestChildIdx;
            } else {
                break;
            }
        }
        return item;
    };

    minCosts.set(getCellKey(startRow, startCol), 0);
    heapPush([0, startRow, startCol]);

    let finalCost = -1;

    while (heap.length > 0) {
        const [currentExpense, currentRow, currentCol] = heapPop();

        if (currentExpense > (minCosts.get(getCellKey(currentRow, currentCol)) || Infinity)) {
            continue;
        }

        if (currentRow === endRow && currentCol === endCol) {
            finalCost = currentExpense;
            break;
        }

        const immediateMoves = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of immediateMoves) {
            const nextRow = currentRow + dr;
            const nextCol = currentCol + dc;

            if (
                nextRow >= 0 && nextRow < gridHeight &&
                nextCol >= 0 && nextCol < gridWidth &&
                mazeGrid[nextRow][nextCol] !== '#'
            ) {
                const newExpense = currentExpense;
                const nextCellKey = getCellKey(nextRow, nextCol);
                if (newExpense < (minCosts.get(nextCellKey) || Infinity)) {
                    minCosts.set(nextCellKey, newExpense);
                    heapPush([newExpense, nextRow, nextCol]);
                }
            }
        }

        for (let rOffset = -2; rOffset <= 2; rOffset++) {
            for (let cOffset = -2; cOffset <= 2; cOffset++) {
                if (rOffset === 0 && cOffset === 0) continue;

                const warpRow = currentRow + rOffset;
                const warpCol = currentCol + cOffset;

                if (
                    warpRow >= 0 && warpRow < gridHeight &&
                    warpCol >= 0 && warpCol < gridWidth &&
                    mazeGrid[warpRow][warpCol] !== '#'
                ) {
                    const newExpense = currentExpense + 1;
                    const warpCellKey = getCellKey(warpRow, warpCol);
                    if (newExpense < (minCosts.get(warpCellKey) || Infinity)) {
                        minCosts.set(warpCellKey, newExpense);
                        heapPush([newExpense, warpRow, warpCol]);
                    }
                }
            }
        }
    }

    console.log(finalCost);
}

Pathfinder(require("fs").readFileSync("/dev/stdin", "utf8"));