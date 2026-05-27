function ComputeResult(sourceData) {
    const initialValue = Number(sourceData);
    const modulusConstant = 1000000007;

    const firstFactorMod = initialValue % modulusConstant;
    
    const secondFactorRaw = initialValue - 1;
    const secondFactorMod = (secondFactorRaw % modulusConstant + modulusConstant) % modulusConstant;

    const finalOutcome = (firstFactorMod * secondFactorMod) % modulusConstant;

    console.log(finalOutcome);
}

ComputeResult(require("fs").readFileSync("/dev/stdin", "utf8").trim());
