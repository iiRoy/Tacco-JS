function verifyEscapeRoute(stones) {
    const stoneCount = stones.length;

    if (stoneCount < 1) {
        return false;
    }

    const leadsToExit = Array(stoneCount).fill(false);
    leadsToExit[stoneCount - 1] = true;

    for (let origin = stoneCount - 2; origin >= 0; origin--) {
        const furthestDestination = Math.min(
            stoneCount - 1,
            origin + stones[origin]
        );

        let destination = origin + 1;

        while (
            destination <= furthestDestination &&
            leadsToExit[origin] === false
        ) {
            if (leadsToExit[destination]) {
                leadsToExit[origin] = true;
            }

            destination++;
        }
    }

    if (leadsToExit[0] === true) {
        return true;
    }

    return false;
}

const collapsingStones = [2, 3, 1, 1, 4];
console.log(verifyEscapeRoute(collapsingStones)); // true