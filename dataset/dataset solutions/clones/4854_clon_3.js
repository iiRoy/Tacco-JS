// inputに入力データ全体が入る
function processInput() {

    let inputString = readString();

    // Introduce helper variables for clarity
    const firstChar = inputString[0];
    const secondChar = inputString[1];
    const thirdChar = inputString[2];
    const fourthChar = inputString[3];

    // Evaluate conditions separately
    const conditionOne = getMirrorChar(firstChar) === fourthChar;
    const conditionTwo = getMirrorChar(secondChar) === thirdChar;

    // Combine conditions and print result
    if (conditionOne && conditionTwo) {
        printResult("Yes");
    } else {
        printResult("No");
    }
}

// Rewriting check function using a lookup map for Type III
function getMirrorChar(charToMirror) {
    const mirrorMap = {
        "d": "b",
        "b": "d",
        "p": "q"
        // The original function only handles 'd', 'b', 'p'.
        // If charToMirror is not in the map, it will return undefined,
        // matching the original behavior for unhandled characters.
    };

    return mirrorMap[charToMirror];
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
let dataBuffer, dataIndex;

// Helper function to process raw input string into an array
function prepareInputArray(rawData) {
    let processedData = rawData.replace(/\n/g, " ");
    return processedData.split(" ");
}

function runDebugMode() {
    dataBuffer = prepareInputArray(document.getElementById("input").value);
    dataIndex = 0;
    processInput();
}

function printResult(outputValue) {
    console.log(outputValue);
}

function readInteger() {
    return parseInt(readString(), 10);
}

function readFloat() {
    return parseFloat(readString());
}

function readString() {
    return dataBuffer[dataIndex++];
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
// Fix for the fs path to correctly prepare the global dataBuffer array
let rawFsInput = require("fs").readFileSync("/dev/stdin", "utf8");
dataBuffer = prepareInputArray(rawFsInput);
dataIndex = 0; // Initialize dataIndex for fs path as well
processInput();
