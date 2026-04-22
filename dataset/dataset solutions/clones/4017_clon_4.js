const processor = (dataString) => {
    const lineContent = dataString.split('\x0A')[0];
    const charCount = lineContent.length;
    const firstNumericChar = lineContent.codePointAt(0);

    const initialPart = (firstNumericChar - 48) - 1;
    const subsequentPart = (charCount - 1) * 9;
    
    const finalOutcome = Math.max(9, initialPart + subsequentPart);
    
    console.log(finalOutcome);
};

const systemInterface = require('node:fs');
const sourceData = systemInterface.readFileSync('/dev/stdin', 'utf8');
processor(sourceData);