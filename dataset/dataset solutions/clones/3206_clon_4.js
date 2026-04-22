function computeValue() {
    const dataSource = (require("fs").readFileSync("/dev/stdin", "utf8")).trim();
    const numberSequence = dataSource.split(/\s+/).map(BigInt);

    const argumentAlpha = numberSequence[0];
    const argumentBeta = numberSequence[1];
    const argumentGamma = numberSequence[2];

    const differenceGammaBeta = argumentGamma - argumentBeta;
    const differenceAlphaBeta = argumentAlpha - argumentBeta;

    let ultimateResult;

    ultimateResult = (differenceAlphaBeta < 2n || differenceGammaBeta < 3n)
        ? argumentAlpha + 1n
        : (differenceAlphaBeta % 2n === 0n)
            ? argumentBeta + (differenceAlphaBeta / 2n) * differenceGammaBeta + 1n
            : argumentBeta + ((differenceAlphaBeta + 1n) / 2n) * differenceGammaBeta;

    console.log(ultimateResult.toString());
}

computeValue();