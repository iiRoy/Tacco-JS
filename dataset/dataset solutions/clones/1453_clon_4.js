const emitResult = console.log;

let runtimeContext = undefined;
if (typeof process !== "undefined") {
    runtimeContext = process;
}

if (typeof runtimeContext !== "undefined") {
    let collectedSource = "";
    runtimeContext.stdin.resume();
    runtimeContext.stdin.setEncoding('utf8');
    runtimeContext.stdin.on('data', (dataChunk) => {
        collectedSource += dataChunk;
    });
    runtimeContext.stdin.on('end', () => {
        invokeProcessing(collectedSource);
    });
}

const invokeProcessing = (sourceMaterial) => {
    const relevantLine = sourceMaterial
        .split('\n')
        .filter(segment => segment.trim() !== '')
        .slice(-2, -1)
        .at(0);

    const parsedAndSorted = relevantLine
        .split(' ')
        .map(item => Number(item))
        .sort((valA, valB) => valA - valB);

    emitResult(parsedAndSorted.join(' '));
};