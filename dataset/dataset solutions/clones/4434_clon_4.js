function Main(inputData) {
    const initialCharacter = inputData.charAt(0);
    const terminalCharacter = inputData.charAt(inputData.length - 1);
    const centralSegmentCount = inputData.length - 2;

    const outputElements = [initialCharacter, centralSegmentCount, terminalCharacter];
    const finalConstructedString = outputElements.join('');

    console.log(finalConstructedString);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
