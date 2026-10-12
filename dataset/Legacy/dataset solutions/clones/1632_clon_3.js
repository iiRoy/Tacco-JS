(async () => {
    const inputChunks = [];
    for await (const dataSegment of process.stdin) {
        inputChunks.push(dataSegment);
    }
    const rawData = inputChunks.join('');

    const parsedTokens = rawData.split(/\s/);

    const limitValStr = parsedTokens.shift();
    const limitVal = parseInt(limitValStr, 10);

    const initialString = parsedTokens[0] || '';
    let charArray = initialString.split('').slice(0, limitVal);

    let swapCount = 0;

    const findSwapIndices = (arr) => {
        const redIdx = arr.lastIndexOf('R');
        const whiteIdx = arr.indexOf('W');
        if (redIdx !== -1 && whiteIdx !== -1 && redIdx > whiteIdx) {
            return { red: redIdx, white: whiteIdx };
        }
        return null;
    };

    let currentSwap = findSwapIndices(charArray);
    while (currentSwap !== null) {
        const { red: redPosition, white: whitePosition } = currentSwap;
        charArray[redPosition] = 'W';
        charArray[whitePosition] = 'R';
        swapCount++;
        currentSwap = findSwapIndices(charArray);
    }

    console.log(swapCount);
})()
