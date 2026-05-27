function processInput(inputSource) {
    const iterationCount = Number.parseInt(inputSource.split('\n')[0], 10);

    Array.from({ length: iterationCount }, (_, currentIdx) => {
        const baseDigit = (currentIdx % 9) + 1;
        const ninesSuffixLength = Math.floor(currentIdx / 9);
        const constructedString = baseDigit.toString() + '9'.repeat(ninesSuffixLength);
        console.log(constructedString);
    });
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
