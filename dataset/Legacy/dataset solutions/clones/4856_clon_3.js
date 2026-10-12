let tokenIndex;
let tokenArray;

function processInput(rawInputData) {
    const normalizedInput = rawInputData.replace(/\n/g, " ");
    tokenArray = normalizedInput.split(" ");
    
    let inputString = readToken();
   
    const isMirroredPair = (getMirrorChar(inputString[0]) === inputString[3]) && 
                           (getMirrorChar(inputString[1]) === inputString[2]);

    printOutput(isMirroredPair ? "Yes" : "No");
}

function getMirrorChar(charToMirror) {
    switch (charToMirror) {
        case "d":
            return "b";
        case "b":
            return "d";
        case "p":
            return "q";
    }
    return undefined;
}

function runDebug() {
    const debugInput = document.getElementById("input").value;
    tokenIndex = 0;
    processInput(debugInput);
}

function printOutput(resultString) {
    console.log(resultString);
}

function readInteger() {
    return parseInt(readToken(), 10);
}

function readFloatingPoint() {
    return parseFloat(readToken());
}

function readToken() {
    const currentToken = tokenArray[tokenIndex];
    tokenIndex++;
    return currentToken;
}

(function initializeAndExecute() {
    tokenIndex = 0;
    processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
