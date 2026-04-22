const processInput = (initialPayload) => {
    const parsedSegments = initialPayload.split('\n');

    const firstLengthIndicator = Number(parsedSegments[0]);
    const secondLengthIndicator = Number(parsedSegments[2]);

    const mainSequence = parsedSegments[1].split(' ').map(Number);
    const targetSequence = parsedSegments[3].split(' ').map(Number);

    const distinctMainElements = new Set(mainSequence);

    const matchCounter = targetSequence.filter(
        (currentItem) => distinctMainElements.has(currentItem)
    ).length;

    console.log(matchCounter);
};

processInput(require("fs").readFileSync("/dev/stdin","utf8"));