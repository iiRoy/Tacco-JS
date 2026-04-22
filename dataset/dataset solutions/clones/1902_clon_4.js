function solveProblem(dataString) {
    const targetValue = Number.parseInt(dataString.trim());

    // Precompute fifth powers for a range of integers.
    // Due to JavaScript's floating-point precision, Math.pow(k, 5) and Math.pow(k^5, 1/5)
    // only reliably yield integers for k up to approximately 2000.
    // The original code's `A-Math.floor(A)==0` check would fail for larger k.
    const fifthPowersContainer = new Map();
    const effectiveMaxRoot = 2000;
    for (let currentRoot = -effectiveMaxRoot; currentRoot <= effectiveMaxRoot; currentRoot++) {
        fifthPowersContainer.set(Math.pow(currentRoot, 5), currentRoot);
    }

    let foundAlpha = 0;
    let foundBeta = 0;

    // The original code iterates B from -100.
    // For values of B greater than effectiveMaxRoot, B^5 would likely exceed
    // the precision limits, causing Math.pow(X + B^5, 1/5) to not yield an exact integer,
    // thus failing the original `A-Math.floor(A)==0` check.
    // Therefore, the effective upper bound for B is also around effectiveMaxRoot.
    for (let currentBeta = -100; currentBeta <= effectiveMaxRoot; currentBeta++) {
        const betaPower = Math.pow(currentBeta, 5);
        const alphaPowerCandidate = targetValue + betaPower;

        if (fifthPowersContainer.has(alphaPowerCandidate)) {
            foundAlpha = fifthPowersContainer.get(alphaPowerCandidate);
            foundBeta = currentBeta;
            break;
        }
    }

    console.log(foundAlpha + " " + foundBeta);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));