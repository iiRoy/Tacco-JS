function verifySudokuState(grid) {
    for (let horizontalIndex = 0; horizontalIndex < 9; horizontalIndex++) {
        const registeredDigits = new Set();

        for (
            let verticalIndex = 0;
            verticalIndex < 9;
            verticalIndex++
        ) {
            const currentDigit =
                grid[horizontalIndex][verticalIndex];

            if (currentDigit === ".") {
                continue;
            }

            if (registeredDigits.has(currentDigit)) {
                return false;
            }

            registeredDigits.add(currentDigit);
        }
    }

    for (let verticalIndex = 0; verticalIndex < 9; verticalIndex++) {
        const registeredDigits = new Set();

        for (
            let horizontalIndex = 0;
            horizontalIndex < 9;
            horizontalIndex++
        ) {
            const currentDigit =
                grid[horizontalIndex][verticalIndex];

            if (currentDigit === ".") {
                continue;
            }

            if (registeredDigits.has(currentDigit)) {
                return false;
            }

            registeredDigits.add(currentDigit);
        }
    }

    for (let regionRow = 0; regionRow < 3; regionRow++) {
        for (
            let regionColumn = 0;
            regionColumn < 3;
            regionColumn++
        ) {
            const registeredDigits = new Set();

            for (
                let internalRow = 0;
                internalRow < 3;
                internalRow++
            ) {
                for (
                    let internalColumn = 0;
                    internalColumn < 3;
                    internalColumn++
                ) {
                    const horizontalIndex =
                        regionRow * 3 + internalRow;

                    const verticalIndex =
                        regionColumn * 3 + internalColumn;

                    const currentDigit =
                        grid[horizontalIndex][verticalIndex];

                    if (currentDigit === ".") {
                        continue;
                    }

                    if (registeredDigits.has(currentDigit)) {
                        return false;
                    }

                    registeredDigits.add(currentDigit);
                }
            }
        }
    }

    return true;
}