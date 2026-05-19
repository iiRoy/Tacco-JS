function Main(inputString) {
    const lines = inputString.split('\n');

    const [gridDimension, colorCount] = lines[0].split(' ').map(Number);

    const costTransformationMatrix = lines.slice(1, 1 + colorCount).map(line =>
        line.split(' ').map(Number)
    );

    const initialColorGrid = lines.slice(1 + colorCount, 1 + colorCount + gridDimension).map(line =>
        line.split(' ').map(value => Number(value) - 1)
    );

    const remainderGroupColorCounts = new Map();
    remainderGroupColorCounts.set(0, new Map());
    remainderGroupColorCounts.set(1, new Map());
    remainderGroupColorCounts.set(2, new Map());

    initialColorGrid.forEach((rowContent, rowIndex) => {
        rowContent.forEach((originalColorIndex, colIndex) => {
            const remainderCategory = (rowIndex + colIndex) % 3;
            const currentCategoryMap = remainderGroupColorCounts.get(remainderCategory);
            currentCategoryMap.set(originalColorIndex, (currentCategoryMap.get(originalColorIndex) || 0) + 1);
        });
    });

    let overallMinimumCost = Infinity;

    const availableColors = Array.from({ length: colorCount }, (_, index) => index);

    availableColors.forEach(targetColorForGroup0 => {
        availableColors.forEach(targetColorForGroup1 => {
            availableColors.forEach(targetColorForGroup2 => {
                if (targetColorForGroup0 === targetColorForGroup1 ||
                    targetColorForGroup1 === targetColorForGroup2 ||
                    targetColorForGroup0 === targetColorForGroup2) {
                    return;
                }

                let currentCombinationTotalCost = 0;

                [0, 1, 2].forEach(remainderGroupIdentifier => {
                    const targetColorForThisGroup = [
                        targetColorForGroup0,
                        targetColorForGroup1,
                        targetColorForGroup2
                    ][remainderGroupIdentifier];

                    const countsInThisGroup = remainderGroupColorCounts.get(remainderGroupIdentifier);

                    countsInThisGroup.forEach((countOfOriginalColor, originalColorIdx) => {
                        currentCombinationTotalCost += countOfOriginalColor * costTransformationMatrix[originalColorIdx][targetColorForThisGroup];
                    });
                });

                overallMinimumCost = Math.min(overallMinimumCost, currentCombinationTotalCost);
            });
        });
    });

    console.log(overallMinimumCost);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
