const inputBuffer = [];
const ioHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioHandler.on('line', (currentLine) => {
    inputBuffer.push(currentLine);
});

ioHandler.on('close', () => {
    const grid = inputBuffer.map(line => line.split(" ").map(Number));

    // The original code attempts to find integers a1, a2, a3 (each from 0 to 100)
    // and b1, b2, b3 such that a set of specific (and somewhat unusual)
    // conditions are met.
    // Let M be the input grid.
    // The original code first defines b1, b2, b3 based on a1 and the first row of M:
    // b1 = M[0][0] - a1
    // b2 = M[0][1] - a1
    // b3 = M[0][2] - a1

    // Then, for a given a1, it iterates a2 (0-100) and checks:
    // a2 + b1 === M[0][1]  (Note: this is M[0][1], not M[1][0])
    // a2 + b2 === M[1][1]
    // a2 + b3 === M[2][1]  (Note: this is M[2][1], not M[1][2])

    // Substituting b1, b2, b3 into these conditions for a2:
    // 1. a2 + (M[0][0] - a1) === M[0][1]  =>  a2 - a1 === M[0][1] - M[0][0]
    // 2. a2 + (M[0][1] - a1) === M[1][1]  =>  a2 - a1 === M[1][1] - M[0][1]
    // 3. a2 + (M[0][2] - a1) === M[2][1]  =>  a2 - a1 === M[2][1] - M[0][2]

    // For a solution to exist, the right-hand sides of these three equations must be equal.
    // Let 'deltaA2' be this common difference (a2 - a1).
    const deltaA2Candidate = grid[0][1] - grid[0][0];

    if (deltaA2Candidate !== grid[1][1] - grid[0][1] ||
        deltaA2Candidate !== grid[2][1] - grid[0][2]) {
        console.log("No");
        return;
    }

    // Similarly, for a given a1, it iterates a3 (0-100) and checks:
    // a3 + b1 === M[0][2]  (Note: this is M[0][2], not M[2][0])
    // a3 + b2 === M[1][2]  (Note: this is M[1][2], not M[2][1])
    // a3 + b3 === M[2][2]

    // Substituting b1, b2, b3 into these conditions for a3:
    // 4. a3 + (M[0][0] - a1) === M[0][2]  =>  a3 - a1 === M[0][2] - M[0][0]
    // 5. a3 + (M[0][1] - a1) === M[1][2]  =>  a3 - a1 === M[1][2] - M[0][1]
    // 6. a3 + (M[0][2] - a1) === M[2][2]  =>  a3 - a1 === M[2][2] - M[0][2]

    // For a solution to exist, the right-hand sides of these three equations must be equal.
    // Let 'deltaA3' be this common difference (a3 - a1).
    const deltaA3Candidate = grid[0][2] - grid[0][0];

    if (deltaA3Candidate !== grid[1][2] - grid[0][1] ||
        deltaA3Candidate !== grid[2][2] - grid[0][2]) {
        console.log("No");
        return;
    }

    // If all consistency checks pass, we need to determine if there exists an integer 'a1'
    // in the range [0, 100] such that:
    // a2 = a1 + deltaA2Candidate is also in [0, 100]
    // a3 = a1 + deltaA3Candidate is also in [0, 100]

    // This translates to a set of inequalities for a1:
    // 0 <= a1 <= 100
    // 0 <= a1 + deltaA2Candidate <= 100  =>  -deltaA2Candidate <= a1 <= 100 - deltaA2Candidate
    // 0 <= a1 + deltaA3Candidate <= 100  =>  -deltaA3Candidate <= a1 <= 100 - deltaA3Candidate

    // We find the intersection of these ranges:
    const minPossibleA1 = Math.max(0, -deltaA2Candidate, -deltaA3Candidate);
    const maxPossibleA1 = Math.min(100, 100 - deltaA2Candidate, 100 - deltaA3Candidate);

    // If the lower bound is less than or equal to the upper bound,
    // then at least one integer 'a1' exists in the valid range.
    if (minPossibleA1 <= maxPossibleA1) {
        console.log("Yes");
    } else {
        console.log("No");
    }
});
