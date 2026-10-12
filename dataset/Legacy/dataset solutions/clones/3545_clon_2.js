var parseInteger = (valueToParse) => parseInt(valueToParse, 10);

var splitByNewline = (textString) => textString.split(/\n/g);

var splitBySpace = (textString) => textString.split(/\s/g);

function processInput(dataString) {
  if (dataString.includes('2')) {
    console.log('No');
  } else {
    console.log('Yes');
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
