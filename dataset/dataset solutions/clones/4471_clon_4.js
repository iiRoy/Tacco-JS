function processDataStream(rawInputSignal) {
    const dataChunks = rawInputSignal.split("\n");
    const firstConfigLine = dataChunks[0].split(" ");

    const elementCountValue = Number.parseInt(firstConfigLine[1], 10);
    const selectionSizeValue = Number.parseInt(firstConfigLine[2], 10);

    // The original 'Calc' function's behavior, including its bug, is analyzed:
    // 1. If 'k' (selectionSizeValue) is 0, the loop in 'Calc' does not execute.
    //    The initial 'result' (0) is returned.
    // 2. If 'k' (selectionSizeValue) is NaN (e.g., input was non-numeric),
    //    the loop condition `i > n - k` becomes `i > NaN`, which is always false.
    //    The loop does not execute, and 0 is returned.
    // 3. If 'n' (elementCountValue) is NaN (e.g., input was non-numeric),
    //    the loop initialization `i = n` sets `i` to NaN.
    //    The loop condition `i > n - k` becomes `NaN > NaN` (if k is number)
    //    or `NaN > NaN` (if k is NaN), which is always false.
    //    The loop does not execute, and 0 is returned.
    // 4. If 'k' is a positive number AND 'n' is a valid number:
    //    The loop starts with `i = n` (where 'n' is the array's length).
    //    The first operation `result += sortedArray[n]` attempts to access an
    //    out-of-bounds index, resulting in `undefined`.
    //    Adding `undefined` to `0` yields `NaN`. All subsequent additions
    //    of numbers to `NaN` will still result in `NaN`.

    if (
        selectionSizeValue === 0 ||
        Number.isNaN(selectionSizeValue) ||
        Number.isNaN(elementCountValue)
    ) {
        console.log(0);
    } else {
        console.log(NaN);
    }
}

function acquireInputSource() {
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
}

processDataStream(acquireInputSource());