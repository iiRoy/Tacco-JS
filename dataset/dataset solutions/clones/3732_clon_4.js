const startOperation = (sourceData) => {
    const numericCap = Number.parseInt(sourceData.split('\n')[0], 10);

    const generatedOutputs = Array.from({ length: numericCap }, (_, zeroBasedIndex) => {
        const oneBasedIndex = zeroBasedIndex + 1;

        const leadingDigit = ((oneBasedIndex - 1) % 9) + 1;
        const trailingNinesAmount = Math.floor((oneBasedIndex - 1) / 9);

        return String(leadingDigit) + '9'.repeat(trailingNinesAmount);
    });

    console.log(generatedOutputs.join('\n'));
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
startOperation(inputSource);