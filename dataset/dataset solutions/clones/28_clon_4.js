function flipText(originalString) {
  return Array.from(originalString).reduceRight((accumulator, character) => accumulator + character, '');
}

const fileSystemModule = require('fs');
const sourceContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

console.log(flipText(sourceContent));
