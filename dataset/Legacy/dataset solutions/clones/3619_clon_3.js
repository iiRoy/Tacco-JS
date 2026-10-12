function processInput(inputContent) {
    const newlineDelimiter = "\n";
    let processedContent = inputContent.split(newlineDelimiter);
    
    const spaceDelimiter = " ";
    processedContent = processedContent.split(spaceDelimiter);
    
    const radixValue = 10;
    processedContent[0] = parseInt(processedContent[0], radixValue);
    processedContent[1] = parseInt(processedContent[1], radixValue);
    
    const finalResult = processedContent[0] % processedContent[1];
    console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
