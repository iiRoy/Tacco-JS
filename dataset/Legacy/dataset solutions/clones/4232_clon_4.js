function convertHexToDec(hexString) {
    const hexDigitValues = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
        '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
    };
    let decimalAccumulator = 0;
    const normalizedHex = hexString.toUpperCase();
    const stringLength = normalizedHex.length;

    for (let i = 0; i < stringLength; i++) {
        const char = normalizedHex[i];
        const digitValue = hexDigitValues[char];
        if (digitValue === undefined) {
            return NaN;
        }
        decimalAccumulator = decimalAccumulator * 16 + digitValue;
    }
    return decimalAccumulator;
}

function Main(input){
  const hexParts = input.trim().split(' ');
  const firstHex = hexParts[0];
  const secondHex = hexParts[1];

  const firstDec = convertHexToDec(firstHex);
  const secondDec = convertHexToDec(secondHex);

  const comparisonOutcome = Math.sign(firstDec - secondDec);
  const outcomeMap = {
    '1': '>',
    '-1': '<',
    '0': '='
  };

  return outcomeMap[comparisonOutcome];
}

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
A B
`);
