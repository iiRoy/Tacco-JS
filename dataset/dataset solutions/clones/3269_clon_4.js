function obtainTargetString() {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const initialLine = rawContent.trim().split('\n')[0];
    const segments = initialLine.split(' ');
    return segments[0];
}

function performCheck() {
    const examinedPhrase = obtainTargetString();
    const referencePattern = "keyence";
    
    for (let idx = 0; idx <= referencePattern.length; idx++) {
        const leadingPart = referencePattern.substring(0, idx);
        const trailingPart = referencePattern.substring(idx);
        
        if (examinedPhrase.startsWith(leadingPart) &&
            examinedPhrase.endsWith(trailingPart) &&
            examinedPhrase.length >= leadingPart.length + trailingPart.length) {
            return "YES";
        }
    }
    
    return "NO";
}

console.log(performCheck());