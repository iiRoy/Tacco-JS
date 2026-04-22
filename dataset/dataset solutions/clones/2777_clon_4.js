function processInput(dataString) {
    if (dataString.length !== 4) {
        console.log('No');
        return;
    }

    const sortedElements = [...dataString].sort().join('');

    if (sortedElements[0] === sortedElements[1] &&
        sortedElements[2] === sortedElements[3] &&
        sortedElements[0] !== sortedElements[2]) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

const receivedPayload = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(receivedPayload);