const processInputData = (rawData) => {
    const lines = rawData.split('\n');
    const initialCount = Number(lines[0]);
    const startingSequence = lines[1].split(' ').map(Number);

    const findMedianOfThree = (valA, valB, valC) => {
        return Math.max(Math.min(valA, valB), Math.min(Math.max(valA, valB), valC));
    };

    const reduceSequence = (currentLayer) => {
        if (currentLayer.length === 1) {
            return currentLayer[0];
        }

        const nextLayerLength = currentLayer.length - 2;
        const nextLayer = Array.from({ length: nextLayerLength }, (_, index) => {
            const firstVal = currentLayer[index];
            const secondVal = currentLayer[index + 1];
            const thirdVal = currentLayer[index + 2];
            return findMedianOfThree(firstVal, secondVal, thirdVal);
        });

        return reduceSequence(nextLayer);
    };

    const finalResult = reduceSequence(startingSequence);
    console.log(finalResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
