process.stdin.resume();
process.stdin.setEncoding('utf8');

function processInput(rawInput) {
    const inputLines = rawInput.trim().split('\n');
    
    const elementCount = Number(inputLines[0]);
    const numberArray = inputLines[1].split(' ').map(Number);

    for (let currentIdx = 1; currentIdx < elementCount; currentIdx++) {
        console.log(numberArray.join(' '));

        const valueToInsert = numberArray[currentIdx];
        let targetPosition = currentIdx;
        
        for (let searchIdx = currentIdx - 1; searchIdx >= 0; searchIdx--) {
            if (numberArray[searchIdx] > valueToInsert) {
                targetPosition = searchIdx;
            } else {
                break;
            }
        }
        
        if (targetPosition !== currentIdx) {
            const [removedElement] = numberArray.splice(currentIdx, 1);
            numberArray.splice(targetPosition, 0, removedElement);
        }
    }

    console.log(numberArray.join(' '));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
