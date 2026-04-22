(function(input) {
    var p = input.split(' ').map(Number);
    var x = p.shift();
    var y = p.shift();
    console.log(greatestCommonDevisor(x, y));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function greatestCommonDevisor(x, y) {
    return Math.max.apply(null, commonDevisor(x, y));
}

function commonDevisor(x, y) {
    if (x > y) {
        x = x % y;
    } else if (x < y) {
        var tmp = y;
        y = x;
        x = tmp % x;
    }
    var a = [];
    for (var i = 1; i <= x; i++) {
        if (x % i === 0 && y % i === 0) {
            a.push(i);
        }
    }
    return a;
}