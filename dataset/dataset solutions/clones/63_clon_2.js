function calculateAscendingLength(sequence) {
    if (sequence.length === 0) {
        return 0;
    }

    const bestAtPosition = new Array(sequence.length).fill(1);
    let globalBest = 1;

    for (let destination = 1; destination < sequence.length; destination++) {
        for (let origin = 0; origin < destination; origin++) {
            if (sequence[origin] < sequence[destination]) {
                bestAtPosition[destination] = Math.max(
                    bestAtPosition[destination],
                    bestAtPosition[origin] + 1
                );
            }
        }

        globalBest = Math.max(
            globalBest,
            bestAtPosition[destination]
        );
    }

    return globalBest;
}

const data = [10, 9, 2, 5, 3, 7, 101, 18];
console.log(calculateAscendingLength(data));