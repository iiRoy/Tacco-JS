function processInputData(rawData) {
    const offsetValue = 8;
    const dataLength = rawData.length;
    const endIndex = dataLength - offsetValue;
    const resultString = rawData.slice(0, endIndex);
    console.log('%s', resultString);
}

function runDebugMode(){
	const debugInput = document.getElementById("input").value;
	processInputData(debugInput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
