const evaluateAvailability = (sourceText) => {
    const textualSegments = sourceText.split('\n');

    const initialParameters = textualSegments[0].split(' ').map(Number);
    const maximumValue = initialParameters[0];
    const collectionCount = initialParameters[1];

    const designatedElements = new Set();

    let segmentIndex = 1;
    for (let iter = 0; iter < collectionCount; iter++) {
        const currentElementStrings = textualSegments[segmentIndex].split(' ');
        currentElementStrings.forEach(strVal => designatedElements.add(Number(strVal)));
        segmentIndex += 2;
    }

    const absentCount = Array.from({ length: maximumValue }, (_, i) => i + 1)
        .filter(num => !designatedElements.has(num))
        .length;

    console.log(absentCount);
};

evaluateAvailability(require("fs").readFileSync("/dev/stdin", "utf8"));