const inputFacility = require('readline');

async function retrieveLineContent() {
    const conversationInterface = inputFacility.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(completionSignal => {
        conversationInterface.question('', (responsePayload) => {
            conversationInterface.close();
            completionSignal(responsePayload);
        });
    });
}

async function processAndDisplay() {
    const acquiredText = await retrieveLineContent();
    const constructedMessage = "ABC" + acquiredText;
    process.stdout.write(constructedMessage + '\n');
}

processAndDisplay();