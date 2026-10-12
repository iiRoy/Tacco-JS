function processInput() {
    let inputString = readStringToken();

    const firstCharacter = inputString[0];
    const secondCharacter = inputString[1];
    const thirdCharacter = inputString[2];
    const fourthCharacter = inputString[3];

    const reflectedFirstCharacter = getReflectedChar(firstCharacter);
    const reflectedSecondCharacter = getReflectedChar(secondCharacter);

    const isFirstPairMatch = (reflectedFirstCharacter === fourthCharacter);
    const isSecondPairMatch = (reflectedSecondCharacter === thirdCharacter);

    if (isFirstPairMatch && isSecondPairMatch) {
        displayResult("Yes");
    } else {
        displayResult("No");
    }
}

const characterMirrorMap = {
    "d": "b",
    "b": "d",
    "p": "q"
    // The original 'check' function had 'if(t == "p")return "q"' twice,
    // meaning 'q' was not explicitly handled and would return undefined.
    // This map preserves that exact behavior for 'q' and other unmapped characters.
};

function getReflectedChar(charToReflect){
    return characterMirrorMap[charToReflect];
}

let rawData, dataIndex;
function runDebugMode(){
	rawData = document.getElementById("input").value;
	rawData = rawData.replace( /\n/g , " " );
	rawData = rawData.split(" ");
	dataIndex = 0;
	processInput();
}
function displayResult(outputValue){
    console.log(outputValue);
}
function readInteger(){
    return parseInt(readStringToken(), 10);
}
function readFloat(){
    return parseFloat(readStringToken());
}
function readStringToken(){
    return rawData[dataIndex++];
}

rawData = require("fs").readFileSync("/dev/stdin", "utf8");
processInput();
