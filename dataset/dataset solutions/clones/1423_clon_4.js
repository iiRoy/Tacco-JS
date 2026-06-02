function processInput(sourceText) {
    const firstLine = sourceText.split("\n")[0];
    
    const transformedLine = Array.from(firstLine).map(currentSymbol => {
        const symbolCode = currentSymbol.charCodeAt(0);
        
        if (symbolCode >= 97 && symbolCode <= 122) {
            return String.fromCharCode(symbolCode - 32);
        } else if (symbolCode >= 65 && symbolCode <= 90) {
            return String.fromCharCode(symbolCode + 32);
        } else {
            return currentSymbol;
        }
    }).join('');
    
    console.log(transformedLine);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
