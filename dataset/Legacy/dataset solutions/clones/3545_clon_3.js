var parseInteger = x => parseInt(x, 10);
var splitByNewline = x => x.split(/\n/g);
var splitBySpace = x => x.split(/\s/g);

function processInputData(rawData) {
  const searchCharacter = '2';
  const inputContainsCharacter = rawData.includes(searchCharacter);

  if (inputContainsCharacter) {
    console.log('No');
  } else {
    console.log('Yes');
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
