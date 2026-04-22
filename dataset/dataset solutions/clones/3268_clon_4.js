function processNumericSequence(rawText) {
    const segments = rawText.split(" ");

    const essentialDigits = new Set(['1', '9', '7', '4']);
    const presentDigits = new Set();

    for (const currentSegment of segments) {
        if (essentialDigits.has(currentSegment)) {
            presentDigits.add(currentSegment);
        }
    }

    if (presentDigits.size === essentialDigits.size) {
        process.stdout.write('YES\n');
    } else {
        process.stdout.write('NO\n');
    }
}

const acquiredText = require("fs").readFileSync("/dev/stdin", "utf8");
processNumericSequence(acquiredText);