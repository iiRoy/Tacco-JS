function processInputData(rawData) {
    const NEWLINE_SEPARATOR = "\n";
    const DECIMAL_RADIX = 10;

    // Helper function to split the raw input string into an array of lines
    const extractLines = (fullInputString) => fullInputString.split(NEWLINE_SEPARATOR);

    // Helper function to convert a string line into an array of characters
    const convertToCharArray = (lineString) => lineString.split("");

    // Helper function to check if two characters are different, returning 1 for different, 0 for same
    const checkCharacterDifference = (charOne, charTwo) => (charOne !== charTwo ? 1 : 0);

    const inputLines = extractLines(rawData);

    const sequenceLength = parseInt(inputLines[0], DECIMAL_RADIX);
    const firstSequence = convertToCharArray(inputLines[1]);
    const secondSequence = convertToCharArray(inputLines[2]);
    const thirdSequence = convertToCharArray(inputLines[3]);

    let diffCountAB = 0;
    let diffCountAC = 0;
    let diffCountBC = 0;

    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        const charFromA = firstSequence[currentIdx];
        const charFromB = secondSequence[currentIdx];
        const charFromC = thirdSequence[currentIdx];

        diffCountAB += checkCharacterDifference(charFromA, charFromB);
        diffCountAC += checkCharacterDifference(charFromA, charFromC);
        diffCountBC += checkCharacterDifference(charFromB, charFromC);
    }

    const totalDiffForA = diffCountAB + diffCountAC;
    const totalDiffForB = diffCountAB + diffCountBC;
    const totalDiffForC = diffCountAC + diffCountBC;

    // Determine the smallest of the three calculated total differences
    const finalMinimumValue = Math.min(totalDiffForA, totalDiffForB, totalDiffForC);

    //出力
    console.log('%d', finalMinimumValue);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
