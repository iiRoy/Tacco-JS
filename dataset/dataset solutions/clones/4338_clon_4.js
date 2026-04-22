const numberConverter = (str) => +str;

function matrixProcessor(sourceInput) {
    const firstDelimiterIndex = sourceInput.indexOf('\n');
    const dimensionLine = sourceInput.substring(0, firstDelimiterIndex);
    const characterBlock = sourceInput.substring(firstDelimiterIndex + 1).replace(/\n/g, '');

    const [rowsStr, colsStr] = dimensionLine.split(' ');
    const verticalExtent = numberConverter(rowsStr);
    const horizontalExtent = numberConverter(colsStr);

    if (horizontalExtent === 1) {
        console.log('Yes');
        return;
    }

    const frequencyRegistry = new Map();
    for (const charItem of characterBlock) {
        frequencyRegistry.set(charItem, (frequencyRegistry.get(charItem) || 0) + 1);
    }

    const verticalParity = verticalExtent % 2;
    const horizontalParity = horizontalExtent % 2;

    const parityState = verticalParity * 2 + horizontalParity; // 0: EE, 1: EO, 2: OE, 3: OO

    switch (parityState) {
        case 0: // Both dimensions are even (00)
            let nonQuadRemainderCount = 0;
            for (const itemValue of frequencyRegistry.values()) {
                if (itemValue % 4 !== 0) {
                    nonQuadRemainderCount++;
                }
            }
            if (nonQuadRemainderCount === 0) {
                console.log('Yes');
            } else {
                console.log('No');
            }
            break;
        case 3: // Both dimensions are odd (11)
            let accumulatedNonQuadValues = 0;
            for (const itemValue of frequencyRegistry.values()) {
                if (itemValue % 4 !== 0) {
                    accumulatedNonQuadValues += itemValue;
                }
            }
            if (accumulatedNonQuadValues % 2 === 1) {
                console.log('Yes');
            } else {
                console.log('No');
            }
            break;
        case 1: // Vertical even, Horizontal odd (01)
        case 2: // Vertical odd, Horizontal even (10)
            let mixedParityNonQuadValues = 0;
            for (const itemValue of frequencyRegistry.values()) {
                if (itemValue % 4 !== 0) {
                    mixedParityNonQuadValues += itemValue;
                }
            }
            if (mixedParityNonQuadValues === 0) {
                console.log('Yes');
            } else {
                console.log('No');
            }
            break;
    }
}

matrixProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));