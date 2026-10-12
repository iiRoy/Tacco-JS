function Main(input) {
    const allNumericValues = input.match(/\d+/g).map(Number);
    const totalNodes = allNumericValues.shift();
    const nodeKeyStorage = [null, ...allNumericValues];

    Array.from({ length: totalNodes }, (_, zeroBasedIndex) => zeroBasedIndex + 1).forEach(
        (currentHeapIndex) => {
            const outputSegments = [];
            outputSegments.push(`node ${currentHeapIndex}: key = ${nodeKeyStorage[currentHeapIndex]}`);

            if (currentHeapIndex > 1) {
                outputSegments.push(`parent key = ${nodeKeyStorage[Math.floor(currentHeapIndex / 2)]}`);
            }

            const leftChildPosition = currentHeapIndex * 2;
            if (leftChildPosition <= totalNodes) {
                outputSegments.push(`left key = ${nodeKeyStorage[leftChildPosition]}`);
            }

            const rightChildPosition = currentHeapIndex * 2 + 1;
            if (rightChildPosition <= totalNodes) {
                outputSegments.push(`right key = ${nodeKeyStorage[rightChildPosition]}`);
            }

            console.log(outputSegments.join(', ') + ', ');
        }
    );
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
