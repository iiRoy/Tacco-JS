const processInputData = (strData) => {
    const allLines = strData.split('\n');
    const params = allLines[0].split(' ').map(Number);
    const totalLength = params[0];
    const flipAllowance = params[1];
    const charSequence = allLines[1];

    if (charSequence.length === 0) {
        console.log(0);
        return;
    }

    const segmentLengths = [];
    let currentSegmentCount = 0;
    let priorChar = charSequence[0];
    let countOfZeroSegments = 0;

    for (let idx = 0; idx < charSequence.length; ++idx) {
        const currentCharacter = charSequence[idx];
        if (currentCharacter !== priorChar) {
            segmentLengths.push(currentSegmentCount);
            if (priorChar === '0') {
                countOfZeroSegments++;
            }
            currentSegmentCount = 1;
        } else {
            currentSegmentCount++;
        }
        priorChar = currentCharacter;
    }
    segmentLengths.push(currentSegmentCount);
    if (priorChar === '0') {
        countOfZeroSegments++;
    }

    if (flipAllowance >= countOfZeroSegments) {
        console.log(totalLength);
        return;
    }

    const firstSegmentIsOne = (charSequence[0] === '1');
    const windowSegmentSize = firstSegmentIsOne ? (flipAllowance * 2 + 1) : (flipAllowance * 2 + 2);

    let currentWindowSum = 0;
    let maximumWindowSum = 0;

    for (let idx = 0; idx < Math.min(windowSegmentSize, segmentLengths.length); ++idx) {
        currentWindowSum += segmentLengths[idx];
    }
    maximumWindowSum = currentWindowSum;

    for (let idx = windowSegmentSize; idx < segmentLengths.length; ++idx) {
        currentWindowSum += segmentLengths[idx];
        currentWindowSum -= segmentLengths[idx - windowSegmentSize];
        if (currentWindowSum > maximumWindowSum) {
            maximumWindowSum = currentWindowSum;
        }
    }
    console.log(maximumWindowSum);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));