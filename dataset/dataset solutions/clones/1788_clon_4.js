const sourceStringValue = 'takahashi';

const finalSegment = Array.from(sourceStringValue).reduce((accumulator, character, index) => {
    if (index < 3) {
        return accumulator + character;
    }
    return accumulator;
}, '');

console.info(finalSegment);