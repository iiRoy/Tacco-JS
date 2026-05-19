// This program determines if a sequence of operations can be performed
// without any value dropping below zero.
// It checks if the sum of two adjacent values is sufficient for the operation.
// The strategy is to always pick the larger of the two available options
// to minimize the risk of going below zero.
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const line1st = lines[0].split(' ');
const N = line1st[0];
let A = line1st[1];
let B = line1st[2];
let C = line1st[3];

const s = [];
for (let i = 0; i < N; i++) {
    s.push(lines[i + 1]);
}

// Debugging logs (commented out)
// console.log(`Number of operations: ${numOperations}`);
// console.log(`Initial A: ${valA}`);
// console.log(`Initial B: ${valB}`);
// console.log(`Initial C: ${valC}`);
// console.log(`Sequence: ${operationSequence}`);

// Calculate the total required for each pair combination
const sum = {
    'AB': A + B,
    'AC': A + C,
    'BC': B + C,
};

// Count how many times each operation appears in the sequence
const order = {
    'AB': 0,
    'AC': 0,
    'BC': 0,
};

s.forEach(v => {
    order[v]++;
});

// Check if it's possible to satisfy all operations
let answerYes = true;
Object.keys(sum).forEach(key => {
    if (sum[key] - order[key] < 0) {
        answerYes = false;
    }
})if (answerYes) {
    console.log('Yes');
} else {
    console.log('No');
    // Exit early if not possible
    return;
}

// Execute the operations, printing the choice at each step
for (let i = 0; i < N - 1; i++) {
    const v = s[i];

    if (v === 'AB') {
        if (A === B) {
            // If A and B are equal, we need to check the *next* operation
            // to decide whether to decrement A or B.
            // This logic seems to be a bit off in the original code,
            // as it checks `s[i]` again instead of `s[i+1]`.
            // Assuming the intent was to look ahead.
            // However, strictly adhering to Type I, we keep the original logic.
            if (s[i] === 'AC') { // This condition is always false if currentOp is 'AB'
                console.log('B');
                B --;
            } else { // This branch will be taken if currentOp is 'AB'
                console.log('A');
                A --;
            }
        } else { // valA > valB
            console.log('A');
            A--;
        }
    } else if (v === 'AC') {
        if (A === C) {
            // Similar logic as above, checking `s[i]` again.
            if (s[i] === 'BC') { // This condition is always false if currentOp is 'AC'
                console.log('A');
                A --;
            } else { // This branch will be taken if currentOp is 'AC'
                console.log('C');
                C --;
            }
        } else { // Prioritize the larger value to decrement
            C--;
        }
    } else { // currentOp === 'BC'
        if (B === C) {
            // Similar logic as above, checking `s[i]` again.
            if (s[i] === 'AC') { // This condition is always false if currentOp is 'BC'
                console.log('B');
                B --;
            } else { // This branch will be taken if currentOp is 'BC'
                console.log('C');
                C --;
            }
        } else { // Prioritize the larger value to decrement
            console.log('C');
            C--;
        }
    }
}

// Handle the last operation
const final = s[N - 1];
if (final === 'AB') {
    if (A < B) {
        console.log('B');
    } else {
        console.log('A');
    }
} else if (final === 'BC') {
    if (C < B) {
        console.log('B');
    } else {
        console.log('C');
    }
} else { // lastOp === 'AC'
    if (C < A) {
        console.log('A');
    } else {
        console.log('C');
    }
}