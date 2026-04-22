function determinePresence(incomingText) {
    const requiredItems = {
        '1': false,
        '7': false,
        '4': false,
        '9': false
    };

    const dataSegments = incomingText.split(' ').slice(0, 4);

    for (const piece of dataSegments) {
        if (Object.prototype.hasOwnProperty.call(requiredItems, piece)) {
            requiredItems[piece] = true;
        }
    }

    const allFound = Object.values(requiredItems).every(Boolean);

    if (allFound) {
        console.log('YES');
    }
}

determinePresence(require("fs").readFileSync("/dev/stdin", "utf8"));