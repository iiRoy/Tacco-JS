const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allNumbers = fileContent.trim().split("\n").map(Number);

function* generateNumberBlocks(sourceNumbers) {
    let currentOffset = 0;
    while (true) {
        const blockSize = sourceNumbers[currentOffset];
        if (blockSize === 0) {
            return;
        }
        const blockData = sourceNumbers.slice(currentOffset + 1, currentOffset + 1 + blockSize);
        yield blockData;
        currentOffset += 1 + blockSize;
    }
}

const processBlockFunctional = (blockNumbers) => {
    const finalArrayForBlock = blockNumbers.reduce((currentArray, currentNum, idx) => {
        if (idx % 2 === 0) {
            return [...currentArray, currentNum];
        } else {
            if (currentArray.length > 0 && currentArray[currentArray.length - 1] === currentNum) {
                return [...currentArray, currentNum];
            } else {
                const tempArray = [...currentArray, currentNum];
                const lastElement = tempArray[tempArray.length - 1];

                let fillFromIndex = tempArray.length - 2;
                while (fillFromIndex >= 0 && tempArray[fillFromIndex] !== lastElement) {
                    fillFromIndex--;
                }

                const headSegment = tempArray.slice(0, fillFromIndex + 1);
                const middleSegmentLength = tempArray.length - 1 - (fillFromIndex + 1);
                const middleSegment = Array(Math.max(0, middleSegmentLength)).fill(lastElement);
                const tailSegment = [lastElement];

                return [...headSegment, ...middleSegment, ...tailSegment];
            }
        }
    }, []);

    return finalArrayForBlock.filter(val => val === 0).length;
};

for (const currentBlock of generateNumberBlocks(allNumbers)) {
    const zeroCount = processBlockFunctional(currentBlock);
    console.log(zeroCount);
}
