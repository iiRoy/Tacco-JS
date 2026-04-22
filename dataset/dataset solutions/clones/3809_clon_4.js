(function(origin) {
    var digitPattern = /(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
    var collected = origin.match(digitPattern);

    var firstTerm = +collected[1];
    var secondTerm = +collected[2];
    var thirdTerm = +collected[3];
    var fourthTerm = +collected[4];

    var intermediateDifference = firstTerm - secondTerm;

    var parityFactor = Math.cos(fourthTerm * Math.PI);

    var ultimateResult = intermediateDifference * parityFactor;

    process.stdout.write(String(ultimateResult) + '\n');
})(Buffer.from(require("node:fs").readFileSync("/dev/stdin")).toString("utf8"));