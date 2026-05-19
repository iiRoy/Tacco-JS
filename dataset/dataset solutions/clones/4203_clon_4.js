function ProcessData(sourceText) {
    let finalVerdict;
    const charSequence = [...sourceText]; 
    
    const hasVowel = charSequence.some(c => 'AEIOUaeiou'.includes(c));
    const numericSum = charSequence.reduce((sum, c) => sum + (Number.isFinite(parseInt(c)) ? parseInt(c) : 0), 0);

    const guaranteedTrueCondition = (numericSum >= 0) && (!hasVowel || hasVowel);

    if (guaranteedTrueCondition) {
        finalVerdict = "YES";
    } else {
        finalVerdict = "NO";
    }
    
    console.log(finalVerdict);
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
