function determineResult(sourceMaterial) {
    const numericalTokens = sourceMaterial.match(/\d+/g) || [];
    
    const valA = numericalTokens[0];
    const valB = numericalTokens[1];

    const numericalEntities = [ parseInt(valA, 10), parseInt(valB, 10) ];

    const consequenceRegister = new Map([
        [true, 0],
        [false, 10]
    ]);

    const finalConsequence = consequenceRegister.get(numericalEntities[0] < numericalEntities[1]);
    console.log(finalConsequence);
}

(function initiateProcessing() {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    determineResult(rawContent);
})();