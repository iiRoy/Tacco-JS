function processArtifact(sourceMaterial) {
    const partitions = sourceMaterial.split('\n');
    const countOfItems = parseInt(partitions[0], 10); 
    const dataSegments = partitions.slice(1);

    const iterationIndices = Array.from({ length: countOfItems }, (_, k) => k);

    const outcomes = iterationIndices.map((currentFocusIndex) => {
        const filteredList = dataSegments.filter((_, filterPosition) => filterPosition !== currentFocusIndex);

        if (filteredList.length === 0) {
            throw new TypeError("Reduce of empty array with no initial value");
        }
        
        return filteredList.reduce((accumulatedMax, currentItem) => accumulatedMax > currentItem ? accumulatedMax : currentItem);
    });

    outcomes.forEach(resultVal => console.log(resultVal));
}

processArtifact(require("fs").readFileSync("/dev/stdin", "utf8"));