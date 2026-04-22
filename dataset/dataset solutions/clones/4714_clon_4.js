const fileSystem = require('fs');

function checkGridExistence(sourceContent) {
    const contentLines = sourceContent.trim().split('\n');
    let currentLinePointer = 0;

    const principalDimension = parseInt(contentLines[currentLinePointer++], 10);
    const fragmentDimension = parseInt(contentLines[currentLinePointer++], 10);

    const principalMatrix = [];
    for (let i = 0; i < principalDimension; i++) {
        principalMatrix.push(contentLines[currentLinePointer++]);
    }

    const fragmentMatrix = [];
    for (let i = 0; i < fragmentDimension; i++) {
        fragmentMatrix.push(contentLines[currentLinePointer++]);
    }

    const isFragmentPresent = Array.from({ length: principalDimension - fragmentDimension + 1 })
        .some((_, verticalShift) => {
            return Array.from({ length: principalDimension - fragmentDimension + 1 })
                .some((_, horizontalShift) => {
                    return Array.from({ length: fragmentDimension })
                        .every((_, fragmentRowIndex) => {
                            const targetRow = principalMatrix[verticalShift + fragmentRowIndex];
                            const searchRow = fragmentMatrix[fragmentRowIndex];
                            return targetRow.substring(horizontalShift, horizontalShift + fragmentDimension) === searchRow;
                        });
                });
        });

    if (isFragmentPresent) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

const retrievedInput = fileSystem.readFileSync("/dev/stdin", "utf8");
checkGridExistence(retrievedInput);