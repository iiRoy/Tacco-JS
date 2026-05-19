function computeMaximumProduct (inputLine) {
    const numericParts = inputLine.split(' ').slice(0, 4).map(Number);

    const [valA, valB, valC, valD] = numericParts;

    const productOne = valA * valB;
    const productTwo = valC * valD;

    console.log(Math.max(productOne, productTwo));
}

computeMaximumProduct(require('fs').readFileSync('/dev/stdin', 'utf8'));
