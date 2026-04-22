const fileSystemAdapter = require('fs');
const sourceDataContent = fileSystemAdapter.readFileSync('/dev/stdin', 'utf8');

const transformedText = sourceDataContent.replace(/[a-zA-Z]/g, (characterToProcess) => {
    if (characterToProcess === characterToProcess.toLowerCase()) {
        // If the character is lowercase, convert it to uppercase
        return characterToProcess.toUpperCase();
    } else {
        // If the character is uppercase, convert it to lowercase
        return characterToProcess.toLowerCase();
    }
});

console.log(transformedText.trim());