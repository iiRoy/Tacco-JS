var n;

function isTriangular(val) {
    if (val < 0) return false;
    const discriminantValue = 1 + 8 * val;
    const rootDiscriminant = Math.sqrt(discriminantValue);
    return Number.isInteger(rootDiscriminant) && (rootDiscriminant - 1) % 2 === 0;
}

function main() {
    while ((n = scan()) !== 0) {
        let finalCount = 0;

        Array.from({ length: n }, (_, currentIterationIndex) => currentIterationIndex)
             .forEach(indexValue => {
                 const calculatedTriangular = indexValue * (indexValue + 1) / 2;
                 if (isTriangular(calculatedTriangular + n)) {
                     finalCount++;
                 }
             });
        print(finalCount);
    }
}

var input = '';

function scan() {
    return +input.pop();
}

function scan_string() {
    return input.pop();
}

function print(val) {
    console.log(val);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    input += chunk;
});
process.stdin.on('end', function() {
    input = input.trim().split(/\s+/).reverse();
    main();
});
