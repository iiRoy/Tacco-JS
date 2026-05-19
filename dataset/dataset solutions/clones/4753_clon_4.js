function processInput(rawData) {
    const stringSegments = rawData.split(" ");

    const products = [
        Number(stringSegments[0]) * Number(stringSegments[1]),
        Number(stringSegments[2]) * Number(stringSegments[3])
    ];

    const maximumResult = products.reduce((currentMax, value) => {
        return (value > currentMax) ? value : currentMax;
    }, products[0]);

    console.log('%d', maximumResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
