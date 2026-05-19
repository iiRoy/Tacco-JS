const fileSystemModule = require('fs');

const processNumericSequence = inputString => {
    const effectiveInput = (inputString === undefined || inputString === null) ? "" : String(inputString);
    const trimmedInput = effectiveInput.trim();

    const parts = trimmedInput.split(" ");
    const parsedNumbers = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === "") {
            parsedNumbers.push(0);
        } else {
            parsedNumbers.push(parseFloat(part));
        }
    }

    const sortedNumbersCollection = parsedNumbers.reduce((accumulator, currentVal) => {
        if (isNaN(currentVal)) {
            accumulator.push(currentVal);
        } else {
            let insertPosition = 0;
            while (insertPosition < accumulator.length && (isNaN(accumulator[insertPosition]) || currentVal < accumulator[insertPosition])) {
                insertPosition++;
            }
            accumulator.splice(insertPosition, 0, currentVal);
        }
        return accumulator;
    }, []);

    console.log(sortedNumbersCollection.join(" "));
};

const handleFileProcessing = (filePath) => {
    fileSystemModule.readFile(filePath, 'utf8', (readError, fileContent) => {
        processNumericSequence(fileContent);
    });
};

const handleStdinProcessing = () => {
    try {
        const stdinContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        processNumericSequence(stdinContent);
    } catch (readError) {
        throw readError;
    }
};

let sourcePath = "";

if (process.argv.length > 2) {
    sourcePath = process.argv[2];
    handleFileProcessing(sourcePath);
} else {
    handleStdinProcessing();
}
