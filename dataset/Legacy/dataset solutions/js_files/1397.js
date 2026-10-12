(function(input) {
    var p = input.split('\n');
    for (var i = 0; i < p.length; i++) {
        var l = p[i];
        if (l.match(/\?/)) {
            return;
        }
        console.log(eval(l));
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));