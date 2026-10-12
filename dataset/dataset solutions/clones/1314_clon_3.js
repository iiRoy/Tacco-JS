(function(input) {
    var l = {};
    var start = 'a'.charCodeAt(0);
    var end = 'z'.charCodeAt(0);

    for (var i = start; i <= end; i++) {
        var ch = String.fromCharCode(i);
        l[ch] = 0;
    }

    var chars = input.split('');
    for (var j = 0; j < chars.length; j++) {
        var e = chars[j].toLowerCase();

        if (l.hasOwnProperty(e)) {
            l[e] = l[e] + 1;
        }
    }

    var result = Object.keys(l).map(function(k) {
        return k + ' : ' + l[k];
    });

    console.log(result.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));