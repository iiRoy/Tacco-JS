const extractSystemParameters = (dataFeed) => {
    const streamItems = dataFeed.trim().split('\n');
    const extentValue = Number(streamItems[0].split(' ')[0]);
    const instructionSet = streamItems.slice(1).map(line => {
        const parts = line.split(' ').map(Number);
        return { location: parts[0], content: parts[1] };
    });
    return { extentValue, instructionSet };
};

const establishNumericLayout = (dimension, directives) => {
    const layoutMap = new Map();
    directives.forEach(directive => {
        layoutMap.set(directive.location - 1, directive.content);
    });

    const digitRepresentation = Array.from({ length: dimension }, (_, currentPos) =>
        layoutMap.has(currentPos) ? layoutMap.get(currentPos) : 'X'
    );
    return digitRepresentation;
};

const formInterpretedString = (layoutArray) => {
    let combined = layoutArray.join('');
    let trimmedLeading = combined.replace(/^X+/, '');
    let normalizedPlaceholders = trimmedLeading.replace(/X/g, '0');
    return normalizedPlaceholders;
};

const deriveSimplifiedString = (sourceString) => {
    if (sourceString === '0' || sourceString === '') {
        return '0';
    }
    let firstSignificantDigitIndex = 0;
    while (firstSignificantDigitIndex < sourceString.length - 1 && sourceString[firstSignificantDigitIndex] === '0') {
        firstSignificantDigitIndex++;
    }
    return sourceString.substring(firstSignificantDigitIndex);
};

const processSequence = (dataFeed) => {
    let finalOutput = -1;

    const { extentValue, instructionSet } = extractSystemParameters(dataFeed);
    
    const digitRepresentation = establishNumericLayout(extentValue, instructionSet);
    
    const interpretedStr = formInterpretedString(digitRepresentation);
    const simplifiedStr = deriveSimplifiedString(interpretedStr);

    if (interpretedStr === '00') {
        finalOutput = 100;
    } else if (interpretedStr === '0') {
        finalOutput = 10;
    } else if (interpretedStr === simplifiedStr) {
        finalOutput = Number(simplifiedStr);
    }

    console.log(finalOutput);
};

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));