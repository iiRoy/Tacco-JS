(function(input) {
    var l = [];
    for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
        l[String.fromCharCode(i)] = 0;
    }

    input.split('').forEach(function(e) {
        e = e.toLowerCase();
        if (e in l) {
            l[e]++;
        }
    });
    console.log(Object.keys(l).map(function(k) {
        return k + ' : ' + this[k];
    }, l).join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));