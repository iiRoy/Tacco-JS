const executeOperation = (sourceContent) => {
    const lineSegments = sourceContent.split('\n');

    lineSegments.sort();

    const outputList = [];
    const currentLength = lineSegments.length;

    for (let iterationCount = 0; iterationCount < 4; iterationCount++) {
        const desiredIndex = currentLength - iterationCount;
        outputList.push(lineSegments[desiredIndex]);
    }

    outputList.forEach(element => console.log(element));
};

const activateUserInterface = () => {
    const grabbedValue = window.document.querySelector("#entryField").value;
    executeOperation(grabbedValue);
};

const fileSystemModule = require('fs');
const dataBuffer = Buffer.alloc(1024 * 1024);
const octetsRead = fileSystemModule.readSync(0, dataBuffer, 0, dataBuffer.length, 0);
const textFromFile = dataBuffer.toString('utf8', 0, octetsRead);

executeOperation(textFromFile);