function processInput(textData) {
    let foundPattern = false;
    let currentPosition = 0;
    const dataLength = textData.length;

    while (currentPosition < dataLength - 1) {
        if (textData.charAt(currentPosition) === 'A' && textData.charAt(currentPosition + 1) === 'C') {
            foundPattern = true;
            break;
        }
        currentPosition++;
    }

    if (foundPattern) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
