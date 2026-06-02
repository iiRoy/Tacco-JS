const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

let segmentCollection = [];
let currentFragment = '';
let characterPosition = 0;

while (characterPosition < sourceData.length) {
    const currentCharacter = sourceData[characterPosition];
    if (currentCharacter === ' ') {
        segmentCollection.push(currentFragment);
        currentFragment = '';
    } else {
        currentFragment += currentCharacter;
    }
    characterPosition++;
}

segmentCollection.push(currentFragment);

console.log(segmentCollection);
