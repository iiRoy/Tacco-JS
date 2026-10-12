function surviveTheRuins(jumpCapacity) {
    if (jumpCapacity.length === 0) {
        return false;
    }

    let farthestSafePosition = 0;
    let explorerPosition = 0;

    while (
        explorerPosition <= farthestSafePosition &&
        explorerPosition < jumpCapacity.length
    ) {
        const possibleLanding =
            explorerPosition + jumpCapacity[explorerPosition];

        farthestSafePosition = Math.max(
            farthestSafePosition,
            possibleLanding
        );

        if (farthestSafePosition >= jumpCapacity.length - 1) {
            return true;
        }

        explorerPosition++;
    }

    return false;
}

const ruins = [2, 3, 1, 1, 4];
console.log(surviveTheRuins(ruins)); // true