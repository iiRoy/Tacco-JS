const processInput = (rawInput) => {
    const [countVal, initialVal] = rawInput.split(" ").map(Number);

    const firstTaste = initialVal;
    const lastTaste = initialVal + countVal - 1;

    const determineOmittedFlavor = (startBoundary, endBoundary) => {
        if (startBoundary <= 0 && endBoundary >= 0) {
            return 0;
        }
        return Math.abs(startBoundary) < Math.abs(endBoundary) ? startBoundary : endBoundary;
    };

    const omittedFlavor = determineOmittedFlavor(firstTaste, lastTaste);

    const totalTasteSum = (firstTaste + lastTaste) * countVal / 2;

    console.log(totalTasteSum - omittedFlavor);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
