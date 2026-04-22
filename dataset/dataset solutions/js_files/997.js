(function(input) {
    var p = input.split('\n').map(Number);
    var n = p.shift();
    var a = p.slice(0, n);

    var max = -Infinity;
    for (var i = 0; i < a.length; i++) {
        for (var j = i + 1; j < a.length; j++) {
            if (a[j] - a[i] > max) {
                max = a[j] - a[i];
            }
        }
    }
    console.log(max);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));