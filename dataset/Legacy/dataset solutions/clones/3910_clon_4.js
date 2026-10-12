function processData(sourceContent) {
    const requiredSet = new Set(['a', 'b', 'c']);
    const presentSet = new Set();

    for (let charIndex = 0; charIndex < sourceContent.length; charIndex++) {
        const currentCharacter = sourceContent[charIndex];
        if (requiredSet.has(currentCharacter)) {
            presentSet.add(currentCharacter);
        }
        if (presentSet.size === requiredSet.size) {
            break;
        }
    }

    const outcome = (presentSet.size === requiredSet.size) ? "Yes" : "No";
    console.log(outcome);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
