function validateStructure(inputString) {
    let priorSize;
    let processedString = inputString;

    do {
        priorSize = processedString.length;
        processedString = processedString.replace(/\(\)/g, '');
        processedString = processedString.replace(/\[\]/g, '');
    } while (processedString.length < priorSize);

    return processedString.length === 0 ? 'yes' : 'no';
}

let receivedSequence;
while ((receivedSequence = readline()) !== '.') {
    print(validateStructure(receivedSequence));
}