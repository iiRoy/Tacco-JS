var numericSequence = [1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51];

var requestedPosition = process.argv[2];

const MIN_VALID_INDEX_VALUE = 1;
const MAX_EXCLUSIVE_INDEX_BOUND = numericSequence.length;

let computedArrayIndex = -1;
let isPositionWithinBounds = false;

if (requestedPosition >= MIN_VALID_INDEX_VALUE && requestedPosition < MAX_EXCLUSIVE_INDEX_BOUND) {
    computedArrayIndex = requestedPosition - MIN_VALID_INDEX_VALUE;
    isPositionWithinBounds = true;
}

if (isPositionWithinBounds) {
    console.log(numericSequence[computedArrayIndex]);
}
