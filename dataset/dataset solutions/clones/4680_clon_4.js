const calculateSeparation = (dataString) => {
    const [spanLength, originA, originB] = dataString.split(' ').map(Number);

    const boundaryA1 = originA;
    const boundaryA2 = originA + spanLength;
    const boundaryB1 = originB;
    const boundaryB2 = originB + spanLength;

    const gapBetweenBAndA = boundaryB1 - boundaryA2;
    const gapBetweenAAndB = boundaryA1 - boundaryB2;

    const finalOutcome = Math.max(0, gapBetweenBAndA, gapBetweenAAndB);

    console.log(finalOutcome);
};

((executionContext) => {
    const fileSystemModule = executionContext.require('fs');
    const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    calculateSeparation(inputContent);
})(globalThis.process);

globalThis.process.stdin.resume();