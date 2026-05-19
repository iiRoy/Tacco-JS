const processInput = (rawData) => {
    const lines = rawData.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const sideLengths = lines[1].split(" ").map(Number);

    const areValuesDistinct = (valA, valB, valC) => new Set([valA, valB, valC]).size === 3;

    const canFormTriangle = (valA, valB, valC) => {
        const sortedSides = [valA, valB, valC].sort((u, v) => u - v);
        return sortedSides[0] + sortedSides[1] > sortedSides[2];
    };

    const resultCount = Array.from({ length: elementCount }).flatMap((_, firstIndex) =>
        Array.from({ length: elementCount }).flatMap((__, secondIndex) =>
            Array.from({ length: elementCount }).flatMap((___, thirdIndex) => {
                if (firstIndex < secondIndex && secondIndex < thirdIndex) {
                    const s1 = sideLengths[firstIndex];
                    const s2 = sideLengths[secondIndex];
                    const s3 = sideLengths[thirdIndex];

                    if (areValuesDistinct(s1, s2, s3) && canFormTriangle(s1, s2, s3)) {
                        return [1];
                    }
                }
                return [];
            })
        )
    ).length;

    console.log(resultCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
