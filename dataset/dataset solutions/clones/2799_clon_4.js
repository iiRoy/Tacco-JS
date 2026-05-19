const fileSystemInterface = require('fs');

const allInputLines = fileSystemInterface.readFileSync('/dev/stdin', 'utf-8').split('\n');
const primaryLine = allInputLines[0];

const duplicateCharacterDetector = /(.)\1/;

if (duplicateCharacterDetector.test(primaryLine)) {
  console.log('Bad');
} else {
  console.log('Good');
}
