(function(input) {
    var p = input.split('\n');
    while (true) {
        var n = Number(p.shift());
        if (n === 0) {
            return;
        }
        var s = p.shift().split(' ', n).map(Number);
        console.log(standardDeviation(s));
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function mean(a) {
    return a.reduce(function(a, b) {
        return a + b;
    }) / a.length;
}

function variance(a) {
    var m = mean(a);
    var v = 0;
    a.forEach(function(e) {
        v += Math.pow(e - m, 2) / a.length;
    });
    return v;
}

function standardDeviation(a) {
    return Math.sqrt(variance(a));
}