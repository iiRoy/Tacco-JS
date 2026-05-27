function evaluateSequence(sourceText) {
    const contentLines = sourceText.split('\n');
    const numberLine = contentLines[1];
    
    const initialArrangement = numberLine.split(' ').map(Number);
    
    const sortedArrangement = [...initialArrangement].sort((firstElement, secondElement) => firstElement - secondElement);
    
    const mismatchCount = initialArrangement.filter((value, index) => value !== sortedArrangement[index]).length;
    
    return mismatchCount <= 2 ? "YES" : "NO";
}

console.log(evaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8")));
