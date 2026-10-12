const TOP_IDX = 0;
const FRONT_IDX = 1;
const RIGHT_IDX = 2;
const BACK_IDX = 3;
const LEFT_IDX = 4;
const BOTTOM_IDX = 5;

const ROTATION_MAPS = {
    'W': [LEFT_IDX, FRONT_IDX, TOP_IDX, BACK_IDX, BOTTOM_IDX, RIGHT_IDX],
    'N': [FRONT_IDX, BOTTOM_IDX, RIGHT_IDX, TOP_IDX, LEFT_IDX, BACK_IDX],
    'E': [RIGHT_IDX, FRONT_IDX, BOTTOM_IDX, BACK_IDX, TOP_IDX, LEFT_IDX],
    'S': [BACK_IDX, TOP_IDX, RIGHT_IDX, BOTTOM_IDX, LEFT_IDX, FRONT_IDX]
};

function Dice(initialFaceValues) {
    this._f = new Array(6);

    this._f[TOP_IDX] = initialFaceValues[0];
    this._f[BACK_IDX] = initialFaceValues[1];
    this._f[RIGHT_IDX] = initialFaceValues[2];
    this._f[LEFT_IDX] = initialFaceValues[3];
    this._f[FRONT_IDX] = initialFaceValues[4];
    this._f[BOTTOM_IDX] = initialFaceValues[5];
}

Object.defineProperty(Dice.prototype, 'top', { get: function() { return this._f[TOP_IDX]; } });
Object.defineProperty(Dice.prototype, 'back', { get: function() { return this._f[BACK_IDX]; } });
Object.defineProperty(Dice.prototype, 'right', { get: function() { return this._f[RIGHT_IDX]; } });
Object.defineProperty(Dice.prototype, 'left', { get: function() { return this._f[LEFT_IDX]; } });
Object.defineProperty(Dice.prototype, 'front', { get: function() { return this._f[FRONT_IDX]; } });
Object.defineProperty(Dice.prototype, 'bottom', { get: function() { return this._f[BOTTOM_IDX]; } });

Dice.prototype.roll = function(moveCommand) {
    const currentFaces = [...this._f];
    const permutation = ROTATION_MAPS[moveCommand];
    
    for (let i = 0; i < 6; i++) {
        this._f[i] = currentFaces[permutation[i]];
    }
};

Dice.prototype.rollToTop = function(targetValue) {
    const currentFaces = this._f;
    const rollDispatch = new Map([
        [currentFaces[RIGHT_IDX], () => this.roll('W')],
        [currentFaces[LEFT_IDX], () => this.roll('E')],
        [currentFaces[BACK_IDX], () => this.roll('N')],
        [currentFaces[FRONT_IDX], () => this.roll('S')]
    ]);

    const action = rollDispatch.get(targetValue);
    if (action) {
        action();
    }
};

Dice.prototype._generateAllOrientations = function() {
    const orientationTuples = [];
    const initialFacesState = [...this._f];

    const applySequence = (sequence) => {
        for (const cmd of sequence) {
            this.roll(cmd);
        }
    };

    const topAlignSequences = [
        [],
        ['N'],
        ['W'],
        ['S'],
        ['E'],
        ['N', 'N']
    ];

    for (const seq of topAlignSequences) {
        this._f = [...initialFacesState];
        applySequence(seq);

        for (let i = 0; i < 4; i++) {
            orientationTuples.push([this._f[TOP_IDX], this._f[BACK_IDX], this._f[RIGHT_IDX]]);
            this.roll('E');
        }
    }

    this._f = initialFacesState;
    return orientationTuples;
};

Dice.prototype.getRightWithTopAndBack = function(targetTopValue, targetBackValue) {
    const allPossibleOrientations = this._generateAllOrientations();

    for (const [currentTop, currentBack, currentRight] of allPossibleOrientations) {
        if (currentTop === targetTopValue && currentBack === targetBackValue) {
            return currentRight;
        }
    }
    return null;
};

Dice.prototype.isEqual = function(otherDice) {
    return this.right === otherDice.getRightWithTopAndBack(this.top, this.back);
};

(function(input) {
    var parsedLines = input.split('\n');
    var firstDiceLabels = parsedLines.shift().split(' ').map(Number);
    var secondDiceLabels = parsedLines.shift().split(' ').map(Number);
    var diceA = new Dice(firstDiceLabels);
    var diceB = new Dice(secondDiceLabels);
    console.log(diceA.isEqual(diceB) ? 'Yes' : 'No');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
