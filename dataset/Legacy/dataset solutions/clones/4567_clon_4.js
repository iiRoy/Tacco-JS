function Main(input) {
    const [primaryDimension, secondaryDimension] = input.split(" ").map(Number);

    const determineMinimalAreaDifference = (lengthA, lengthB) => {
        let currentBestDifference = Number.MAX_SAFE_INTEGER;

        // Scenario 1: Split lengthA into floor(lengthA/3) and remaining, then split remaining lengthB-wise
        const firstSegmentA = Math.floor(lengthA / 3);
        const remainingSegmentA = lengthA - firstSegmentA;
        const configurationOneAreas = [
            firstSegmentA * lengthB,
            remainingSegmentA * Math.ceil(lengthB / 2),
            remainingSegmentA * Math.floor(lengthB / 2)
        ];
        currentBestDifference = Math.min(currentBestDifference, Math.max(...configurationOneAreas) - Math.min(...configurationOneAreas));

        // Scenario 2: Split lengthA into ceil(lengthA/3) and remaining, then split remaining lengthB-wise
        const secondSegmentA = Math.ceil(lengthA / 3);
        const leftoverSegmentA = lengthA - secondSegmentA;
        const configurationTwoAreas = [
            secondSegmentA * lengthB,
            leftoverSegmentA * Math.ceil(lengthB / 2),
            leftoverSegmentA * Math.floor(lengthB / 2)
        ];
        currentBestDifference = Math.min(currentBestDifference, Math.max(...configurationTwoAreas) - Math.min(...configurationTwoAreas));

        // Scenario 3: Direct three-way cut along lengthA
        if (lengthA % 3 === 0) {
            currentBestDifference = Math.min(currentBestDifference, 0);
        } else {
            // If lengthA is not perfectly divisible by 3, the smallest possible difference
            // when cutting into three pieces along lengthA is lengthB.
            currentBestDifference = Math.min(currentBestDifference, lengthB);
        }

        return currentBestDifference;
    };

    let overallSmallestDifference = Number.MAX_SAFE_INTEGER;

    // Evaluate cutting strategies with primaryDimension as the one being split into three main sections
    overallSmallestDifference = Math.min(overallSmallestDifference, determineMinimalAreaDifference(primaryDimension, secondaryDimension));

    // Evaluate cutting strategies with secondaryDimension as the one being split into three main sections
    overallSmallestDifference = Math.min(overallSmallestDifference, determineMinimalAreaDifference(secondaryDimension, primaryDimension));

    console.log(overallSmallestDifference);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
