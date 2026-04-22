const fileSystem = require('fs');
const sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedSegments = sourceData.trim().split('\n');

for (const currentUnit of processedSegments) {
    if (currentUnit === ".") {
        break;
    }

    let validityFlag = true;
    const bracketReservoir = [];

    for (const characterToken of currentUnit) {
        if (characterToken === '(' || characterToken === '[') {
            bracketReservoir.push(characterToken);
        } else if (characterToken === ')') {
            if (bracketReservoir.length === 0 || bracketReservoir.pop() !== '(') {
                validityFlag = false;
                break;
            }
        } else if (characterToken === ']') {
            if (bracketReservoir.length === 0 || bracketReservoir.pop() !== '[') {
                validityFlag = false;
                break;
            }
        }
        // Other characters are implicitly ignored, maintaining functional equivalence.
    }

    if (validityFlag && bracketReservoir.length === 0) {
        process.stdout.write("yes\n");
    } else {
        process.stdout.write("no\n");
    }
}