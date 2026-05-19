function main(input) {
    const sourceString = input[0];
    const targetString = input[1];

    if (sourceString.length !== targetString.length) {
        console.log("No");
        return;
    }

    const extendedSource = sourceString + sourceString;
    const isCyclicPermutation = extendedSource.includes(targetString);

    console.log(isCyclicPermutation ? "Yes" : "No");
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
