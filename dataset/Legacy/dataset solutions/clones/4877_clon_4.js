function processInput(textStream) {
    if (textStream.length <= 1) {
        console.log(0);
        return;
    }

    const changedSegments = textStream.split('').slice(1).filter((currentSymbol, position) => {
        const priorSymbol = textStream[position];
        return currentSymbol !== priorSymbol;
    });

    console.log(changedSegments.length);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
