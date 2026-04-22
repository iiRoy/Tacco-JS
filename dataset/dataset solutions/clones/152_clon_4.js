const inputBuffer = require('fs').readFileSync(0);
const rawInputLines = inputBuffer.toString().trim().split('\n');

const totalGridRows = rawInputLines.length;
const totalGridCols = rawInputLines[0].length;

let hPosition = 0;
let vPosition = 0;

const MovementDesignations = {
    NORTHBOUND: 'U',
    EASTBOUND: 'R',
    SOUTHBOUND: 'D',
    WESTBOUND: 'L'
};

let currentOrientation = MovementDesignations.EASTBOUND;

const traversalPath = [];

function checkCellAvailability(rowIdx, colIdx) {
    return rowIdx >= 0 && rowIdx < totalGridRows &&
           colIdx >= 0 && colIdx < totalGridCols &&
           rawInputLines[rowIdx][colIdx] === '1';
}

const actionPlans = new Map();

actionPlans.set(MovementDesignations.EASTBOUND, [
    { // Try NORTH
        validate: (v, h) => checkCellAvailability(v * 2 - 1, h),
        execute: (v, h) => [v - 1, h],
        newOrientation: MovementDesignations.NORTHBOUND
    },
    { // Try EAST
        validate: (v, h) => checkCellAvailability(v * 2, h),
        execute: (v, h) => [v, h + 1],
        newOrientation: MovementDesignations.EASTBOUND
    },
    { // Try SOUTH
        validate: (v, h) => checkCellAvailability(v * 2 + 1, h),
        execute: (v, h) => [v + 1, h],
        newOrientation: MovementDesignations.SOUTHBOUND
    },
    { // Try WEST
        validate: (v, h) => checkCellAvailability(v * 2, h - 1),
        execute: (v, h) => [v, h - 1],
        newOrientation: MovementDesignations.WESTBOUND
    }
]);

actionPlans.set(MovementDesignations.SOUTHBOUND, [
    { // Try EAST
        validate: (v, h) => checkCellAvailability(v * 2, h),
        execute: (v, h) => [v, h + 1],
        newOrientation: MovementDesignations.EASTBOUND
    },
    { // Try SOUTH
        validate: (v, h) => checkCellAvailability(v * 2 + 1, h),
        execute: (v, h) => [v + 1, h],
        newOrientation: MovementDesignations.SOUTHBOUND
    },
    { // Try WEST
        validate: (v, h) => checkCellAvailability(v * 2, h - 1),
        execute: (v, h) => [v, h - 1],
        newOrientation: MovementDesignations.WESTBOUND
    },
    { // Try NORTH
        validate: (v, h) => checkCellAvailability(v * 2 - 1, h),
        execute: (v, h) => [v - 1, h],
        newOrientation: MovementDesignations.NORTHBOUND
    }
]);

actionPlans.set(MovementDesignations.WESTBOUND, [
    { // Try SOUTH
        validate: (v, h) => checkCellAvailability(v * 2 + 1, h),
        execute: (v, h) => [v + 1, h],
        newOrientation: MovementDesignations.SOUTHBOUND
    },
    { // Try WEST
        validate: (v, h) => checkCellAvailability(v * 2, h - 1),
        execute: (v, h) => [v, h - 1],
        newOrientation: MovementDesignations.WESTBOUND
    },
    { // Try NORTH
        validate: (v, h) => checkCellAvailability(v * 2 - 1, h),
        execute: (v, h) => [v - 1, h],
        newOrientation: MovementDesignations.NORTHBOUND
    },
    { // Try EAST
        validate: (v, h) => checkCellAvailability(v * 2, h),
        execute: (v, h) => [v, h + 1],
        newOrientation: MovementDesignations.EASTBOUND
    }
]);

actionPlans.set(MovementDesignations.NORTHBOUND, [
    { // Try WEST
        validate: (v, h) => checkCellAvailability(v * 2, h - 1),
        execute: (v, h) => [v, h - 1],
        newOrientation: MovementDesignations.WESTBOUND
    },
    { // Try NORTH
        validate: (v, h) => checkCellAvailability(v * 2 - 1, h),
        execute: (v, h) => [v - 1, h],
        newOrientation: MovementDesignations.NORTHBOUND
    },
    { // Try EAST
        validate: (v, h) => checkCellAvailability(v * 2, h),
        execute: (v, h) => [v, h + 1],
        newOrientation: MovementDesignations.EASTBOUND
    },
    { // Try SOUTH
        validate: (v, h) => checkCellAvailability(v * 2 + 1, h),
        execute: (v, h) => [v + 1, h],
        newOrientation: MovementDesignations.SOUTHBOUND
    }
]);

for (let stepCount = 0; stepCount < 1000000; stepCount++) {
    const currentActionSequence = actionPlans.get(currentOrientation);
    let actionExecuted = false;

    for (const plan of currentActionSequence) {
        if (plan.validate(vPosition, hPosition)) {
            const [nextV, nextH] = plan.execute(vPosition, hPosition);
            vPosition = nextV;
            hPosition = nextH;
            currentOrientation = plan.newOrientation;
            traversalPath.push(currentOrientation);
            actionExecuted = true;
            break;
        }
    }

    if (!actionExecuted) {
        // This indicates a logical flaw if the problem guarantees a solvable path.
        // The original code always finds a path by its 'else' branches.
        break;
    }

    if (hPosition === 0 && vPosition === 0) {
        break;
    }
}

console.log(traversalPath.join(''));