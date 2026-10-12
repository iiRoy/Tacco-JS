(function(input) {
    var p = input.split('\n');
    for (var i = 0; i < p.length; i++) {
        var x = Number(p[i]);
        if (x === 0) {
            return;
        }
        console.log(String(x).split('').map(Number).reduce(function(a, b) {
            return a + b;
        }));
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));