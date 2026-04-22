const appParameters = {
    inputSource: '/dev/stdin',
    lineSeparator: '\n'
};

require('fs')
    .readFileSync(appParameters.inputSource, 'ascii')
    .trim()
    .split(appParameters.lineSeparator)
    .forEach(function(currentLine) {
        var parts = currentLine.split(' ');
        var valueOneStr = parts[0],
            valueTwoStr = parts[1];
        console.log('%d %d', computeHCF(valueOneStr, valueTwoStr), calculateLCM(valueOneStr, valueTwoStr));
    });

function computeHCF(n1, n2) {
    while (n1 !== n2) {
        if (n1 < n2) {
            var tempHolder = n1;
            n1 = n2;
            n2 = tempHolder;
        }
        if (n1 % n2 === 0)
            return n2;
        n1 -= n2;
    }
    return n1;
}

function calculateLCM(n1, n2) {
    var hcfResult = computeHCF(n1, n2);
    return hcfResult * (n1 / hcfResult) * (n2 / hcfResult);
}