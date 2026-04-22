let capturedInput = '';

process.stdin.on('data', (segment) => {
    capturedInput += segment.toString();
});

process.stdin.on('end', () => {
    processInputAndCompute(capturedInput);
});

const twoToThePower = (exp) => 1 << exp;

function determinePattyCount(level, layersEaten) {
    let currentPattySum = 0;
    let currentDepth = level;
    let remainingLayers = layersEaten;

    while (true) {
        if (currentDepth === 0) {
            currentPattySum += 1;
            break;
        }

        const subBurgerThickness = twoToThePower(currentDepth + 1) - 3;
        const subBurgerPattyCount = twoToThePower(currentDepth) - 1;

        if (remainingLayers === 1) { // Bottom bun
            break;
        } else if (remainingLayers <= 1 + subBurgerThickness) { // Bottom bun + part/all of first sub-burger
            currentDepth--;
            remainingLayers--;
        } else if (remainingLayers === 1 + subBurgerThickness + 1) { // Bottom bun + first sub-burger + middle patty
            currentPattySum += subBurgerPattyCount + 1;
            break;
        } else if (remainingLayers <= 1 + subBurgerThickness + 1 + subBurgerThickness) { // Bottom bun + first sub-burger + middle patty + part/all of second sub-burger
            currentPattySum += subBurgerPattyCount + 1;
            currentDepth--;
            remainingLayers -= (1 + subBurgerThickness + 1);
        } else { // All layers eaten
            currentPattySum += subBurgerPattyCount + 1 + subBurgerPattyCount;
            break;
        }
    }
    return currentPattySum;
}

function processInputAndCompute(fullText) {
    const textLines = fullText.trim().split('\n');
    const primaryParameters = textLines[0].split(' ');

    const burgerConstructionLevel = parseInt(primaryParameters[0], 10);
    const layersToConsume = parseInt(primaryParameters[1], 10);

    const totalEatenPatties = determinePattyCount(burgerConstructionLevel, layersToConsume);

    process.stdout.write(String(totalEatenPatties) + '\n');
}