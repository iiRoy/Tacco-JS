function* characterSequence(firstString, secondString) {
    const totalElements = firstString.length + secondString.length;
    let currentPosition = 0;

    while (currentPosition < totalElements) {
        if (currentPosition % 2 === 0) {
            yield firstString[currentPosition / 2];
        } else {
            yield secondString[currentPosition / 2];
        }
        currentPosition++;
    }
}

function ProcessInput(rawData) {
    const [lineOne, lineTwo] = rawData.split("\n");

    for (const item of characterSequence(lineOne, lineTwo)) {
        console.log(item);
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
