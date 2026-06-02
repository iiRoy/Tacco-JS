const fileSystemModule = require('fs');
const inputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const uppercasePattern = /[A-Z]/;
const hasUppercaseChar = uppercasePattern.test(inputContent);

let resultCharacter;
if (hasUppercaseChar) {
    resultCharacter = 'A';
} else {
    resultCharacter = 'a';
}

console.log(resultCharacter);
