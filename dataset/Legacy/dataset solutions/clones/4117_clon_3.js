const NEWLINE_SEPARATOR = "\n";
const WHITESPACE_SEPARATOR = " ";
const HYPHEN_SEPARATOR = "-";
const EXPECTED_PART_COUNT = 2;

function processInput(rawData) {
    const processedTokens = rawData.split(NEWLINE_SEPARATOR)
                                   .reduce((accumulator, currentLine) => {
                                       const lineTokens = currentLine.split(WHITESPACE_SEPARATOR);
                                       return accumulator.concat(lineTokens);
                                   }, []);

    const getNextStringToken = () => processedTokens.shift();
    const getNextIntegerToken = () => parseInt(processedTokens.shift(), 10);

    const requiredLengthA = getNextIntegerToken();
    const requiredLengthB = getNextIntegerToken();

    const fullString = getNextStringToken();
    const stringParts = fullString.split(HYPHEN_SEPARATOR);

    // Validate the structure of the hyphenated string
    if (stringParts.length !== EXPECTED_PART_COUNT) {
        return "No";
    }

    const firstPart = stringParts[0];
    const secondPart = stringParts[1];

    // Validate the length of the first segment
    const actualFirstPartLength = firstPart.length;
    if (actualFirstPartLength !== requiredLengthA) {
        return "No";
    }

    // Validate the length of the second segment
    const actualSecondPartLength = secondPart.length;
    if (actualSecondPartLength !== requiredLengthB) {
        return "No";
    }

    // If all validations pass
    return "Yes";
}

// The following part handles input/output environment and should remain unchanged
((b,c,d)=>"undefined"!=typeof require?console.log(processInput(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return processInput(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
3 4
269-66-0
`);
