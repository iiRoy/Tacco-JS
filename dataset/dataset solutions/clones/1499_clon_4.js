((rawArgumentVector) => {
    const primaryMagnitude = parseInt(rawArgumentVector[2], 10);

    let currentCycle = 1;

    for (;;) {
        const testExpressionValue = (8 * primaryMagnitude * currentCycle) + 1;
        
        let potentialSquareRoot = 1;
        let exactRootValue = null;

        while (potentialSquareRoot * potentialSquareRoot <= testExpressionValue) {
            if (potentialSquareRoot * potentialSquareRoot === testExpressionValue) {
                exactRootValue = potentialSquareRoot;
                break;
            }
            potentialSquareRoot++;
        }

        if (exactRootValue !== null && (exactRootValue % 2 === 1)) {
            console.log((exactRootValue - 1) / 2);
            break;
        }
        currentCycle++;
    }
})(process.argv);