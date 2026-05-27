const fileSystem = require('fs');
let sourceText = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();

sourceText = sourceText.replace(/peach|apple/g, (matchedPhrase) => {
    if (matchedPhrase === 'peach') {
        return 'apple';
    }
    if (matchedPhrase === 'apple') {
        return 'peach';
    }
    return matchedPhrase;
});

console.log(sourceText);
