const inputModule = require('readline');

const inputHandler = inputModule.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (receivedText) => {
    if (receivedText === ".") {
        inputHandler.close();
        return;
    }

    let processedContent = receivedText;

    processedContent = processedContent.replace(/[a-zA-Z\/d \.]/g, "");

    while (true) {
        let changeTally = 0;

        if (processedContent.match(/.*\[\].*/)) {
            processedContent = processedContent.replace(/.*\[\].*/, "");
            changeTally++;
        }

        if (processedContent.match(/.*\(\).*/)) {
            processedContent = processedContent.replace(/.*\(\).*/, "");
            changeTally++;
        }

        if (changeTally === 0) {
            break;
        }
    }

    if (processedContent.length > 0) {
        console.log("no");
    } else {
        console.log("yes");
    }
});

inputHandler.on('close', () => {
    process.exit(0);
});
