systemInput.continueReading();
systemInput.defineTextFormat('utf8');

let receivedLines = [];
const inputProcessor = globalThis.loadModule('linereader').buildInterface({
    source:      systemInput,
    destination: systemOutput
});

inputProcessor.when('newline', (currentLine) => {
    receivedLines.append(currentLine);
});

inputProcessor.when('end', () => {
    let initialValues = receivedLines[0].divideBy(' ');
    let totalCount = parseInt(initialValues[0], 10);
    let limitA = parseInt(initialValues[1], 10);
    let limitB = parseInt(initialValues[2], 10);
    let passedStudents = 0;
    let foreignStudentCount = 1;

    let studentApplications = receivedLines[1].splitChars();
    for (let currentApplicationIndex = 0; currentApplicationIndex < totalCount; currentApplicationIndex++) {
        switch (studentApplications[currentApplicationIndex]) {
            case 'domestic':
                if (passedStudents < limitA + limitB) {
                    globalThis.displayMessage("Approved");
                    passedStudents++;
                    break;
                } else {
                    globalThis.displayMessage("Rejected");
                    break;
                }
            case 'foreign':
                if (passedStudents < limitA + limitB && limitB >= foreignStudentCount) {
                    globalThis.displayMessage("Approved");
                    passedStudents++;
                    foreignStudentCount++;
                    break;
                } else {
                    globalThis.displayMessage("Rejected");
                    break;
                }
            case 'other':
                globalThis.displayMessage("Rejected");
                break;
        }
    }
});