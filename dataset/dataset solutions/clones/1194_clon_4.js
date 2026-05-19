class Dice {
    #values;

    constructor(initialValues) {
        this.#values = [...initialValues];
    }

    get top() { return this.#values[0]; }
    get front() { return this.#values[1]; }
    get right() { return this.#values[2]; }
    get left() { return this.#values[3]; }
    get back() { return this.#values[4]; }
    get bottom() { return this.#values[5]; }

    #applyPermutation(permutationIndices) {
        const newValues = new Array(6);
        for (let i = 0; i < 6; i++) {
            newValues[i] = this.#values[permutationIndices[i]];
        }
        this.#values = newValues;
    }

    static #rollPermutations = {
        'E': [3, 1, 0, 5, 4, 2],
        'N': [1, 5, 2, 3, 0, 4],
        'S': [4, 0, 2, 3, 5, 1],
        'W': [2, 1, 5, 0, 4, 3]
    };

    static #turnPermutations = {
        'R': [0, 3, 1, 4, 2, 5],
        'L': [0, 2, 4, 1, 3, 5]
    };

    roll(direction) {
        this.#applyPermutation(Dice.#rollPermutations[direction]);
    }

    turn(direction) {
        this.#applyPermutation(Dice.#turnPermutations[direction]);
    }

    setTop(targetTopValue) {
        if (this.#values[0] === targetTopValue) return;

        const targetIndex = this.#values.indexOf(targetTopValue);

        const rollSequences = {
            1: ['N'],
            2: ['W'],
            3: ['E'],
            4: ['S'],
            5: ['N', 'N']
        };

        const sequence = rollSequences[targetIndex];
        if (sequence) {
            sequence.forEach(dir => this.roll(dir));
        }
    }

    setFront(targetFrontValue) {
        if (this.#values[1] === targetFrontValue) return;

        const targetIndex = this.#values.indexOf(targetFrontValue);

        const turnSequences = {
            2: ['R'],
            3: ['L'],
            4: ['R', 'R']
        };

        const sequence = turnSequences[targetIndex];
        if (sequence) {
            sequence.forEach(dir => this.turn(dir));
        }
    }

    equals(otherDice) {
        return this.#values.every((val, idx) => val === otherDice.#values[idx]);
    }
}

function generateAllDiceOrientations(initialValues) {
    const allOrientations = [];
    const currentWorkingDice = new Dice(initialValues);

    for (let i = 0; i < 4; i++) {
        allOrientations.push(new Dice([currentWorkingDice.top, currentWorkingDice.front, currentWorkingDice.right, currentWorkingDice.left, currentWorkingDice.back, currentWorkingDice.bottom]));
        currentWorkingDice.turn('R');
    }

    for (let i = 0; i < 3; i++) {
        currentWorkingDice.roll('N');
        for (let j = 0; j < 4; j++) {
            allOrientations.push(new Dice([currentWorkingDice.top, currentWorkingDice.front, currentWorkingDice.right, currentWorkingDice.left, currentWorkingDice.back, currentWorkingDice.bottom]));
            currentWorkingDice.turn('R');
        }
    }

    currentWorkingDice.roll('E');
    for (let i = 0; i < 4; i++) {
        allOrientations.push(new Dice([currentWorkingDice.top, currentWorkingDice.front, currentWorkingDice.right, currentWorkingDice.left, currentWorkingDice.back, currentWorkingDice.bottom]));
        currentWorkingDice.turn('R');
    }

    currentWorkingDice.roll('E');
    for (let i = 0; i < 4; i++) {
        allOrientations.push(new Dice([currentWorkingDice.top, currentWorkingDice.front, currentWorkingDice.right, currentWorkingDice.left, currentWorkingDice.back, currentWorkingDice.bottom]));
        currentWorkingDice.turn('R');
    }

    return allOrientations;
}

let inputBuffer = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    const lines = inputBuffer.trim().split("\n");

    const originValues = lines[0].split(' ').map(Number);
    const targetValues = lines[1].split(' ').map(Number);

    const origin_dice = new Dice(originValues);
    
    const targetOrientations = generateAllDiceOrientations(targetValues);

    let result = 'No';
    for (const orientedTargetDice of targetOrientations) {
        if (origin_dice.equals(orientedTargetDice)) {
            result = 'Yes';
            break;
        }
    }
    console.log(result);
});
