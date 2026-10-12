const processInput = inputData => {
    const firstLineContent = inputData.split('\n')[0];
    const patternMatch = firstLineContent.match(/^[^ ]+\s+(\S)/);
    const targetCharacter = patternMatch[1];

    console.log("A" + targetCharacter + "C");
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
