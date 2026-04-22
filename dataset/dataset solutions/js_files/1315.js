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
        return k + ': ' + this[k];
    }, l).join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parse(str, sep, ter) {
    sep = typeof(sep) !== 'undefined' ? sep : ' ';
    ter = typeof(ter) !== 'undefined' ? ter : '\n';
    str = str.replace(/\n$/, '');
    var a = str.split(ter);
    for (var i = 0; i < a.length; i++) {
        a[i] = a[i].split(sep);
    }
    return a;
}