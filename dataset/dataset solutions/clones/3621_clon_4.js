const processExternalData = (incomingText) => {
    const numericalTarget = Number.parseInt(incomingText.trim().split('\n')[0], 10);

    const achievableValues = new Set();
    let currentX = 0;
    while (currentX <= 25) {
        let currentY = 0;
        while (currentY <= 14) {
            achievableValues.add((4 * currentX) + (7 * currentY));
            currentY++;
        }
        currentX++;
    }

    if (achievableValues.has(numericalTarget)) {
        globalThis.console.log('Yes');
    } else {
        globalThis.console.log('No');
    }
};

processExternalData(require("node:fs").readFileSync("/dev/stdin", "utf8"));