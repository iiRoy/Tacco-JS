const evaluateText = (sourceContent) => {
    const processedValue = sourceContent.trim();
    const finalOutcome = (processedValue.length > 0) ? "yes" : "";
    return finalOutcome;
};
console.log(evaluateText(require('fs').readFileSync('/dev/stdin', 'utf8')));