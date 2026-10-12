function obtainTransformationCost(initialText, desiredText) {
    const verticalSize = initialText.length + 1;
    const horizontalSize = desiredText.length + 1;

    const operationMatrix = Array.from(
        { length: verticalSize },
        () => new Array(horizontalSize).fill(0)
    );

    for (
        let verticalPosition = 0;
        verticalPosition < verticalSize;
        verticalPosition++
    ) {
        operationMatrix[verticalPosition][0] =
            verticalPosition;
    }

    for (
        let horizontalPosition = 0;
        horizontalPosition < horizontalSize;
        horizontalPosition++
    ) {
        operationMatrix[0][horizontalPosition] =
            horizontalPosition;
    }

    for (
        let verticalPosition = 1;
        verticalPosition < verticalSize;
        verticalPosition++
    ) {
        for (
            let horizontalPosition = 1;
            horizontalPosition < horizontalSize;
            horizontalPosition++
        ) {
            const initialCharacter =
                initialText[verticalPosition - 1];

            const desiredCharacter =
                desiredText[horizontalPosition - 1];

            if (initialCharacter === desiredCharacter) {
                operationMatrix
                    [verticalPosition]
                    [horizontalPosition] =
                        operationMatrix
                            [verticalPosition - 1]
                            [horizontalPosition - 1];
            } else {
                const removalPrice =
                    operationMatrix
                        [verticalPosition - 1]
                        [horizontalPosition] + 1;

                const additionPrice =
                    operationMatrix
                        [verticalPosition]
                        [horizontalPosition - 1] + 1;

                const replacementPrice =
                    operationMatrix
                        [verticalPosition - 1]
                        [horizontalPosition - 1] + 1;

                operationMatrix
                    [verticalPosition]
                    [horizontalPosition] = Math.min(
                        removalPrice,
                        additionPrice,
                        replacementPrice
                    );
            }
        }
    }

    return operationMatrix
        [verticalSize - 1]
        [horizontalSize - 1];
}