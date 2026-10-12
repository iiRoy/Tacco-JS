const processInput = (rawInput) => {
    const [firstLineContent, secondLineContent] = rawInput.split('\n');
    const elementCount = Number(firstLineContent);
    const sourceValues = secondLineContent.split(' ').map(Number);

    const expandedValues = sourceValues.flatMap(item => [item, item]);

    expandedValues.sort((valA, valB) => valB - valA);

    const computedSum = expandedValues.reduce((accumulator, currentItem, currentIndex) => {
        if (currentIndex === 0) {
            return accumulator + currentItem;
        }
        if (currentIndex >= 2 && currentIndex < elementCount) {
            return accumulator + currentItem;
        }
        return accumulator;
    }, 0);

    console.log(computedSum);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
