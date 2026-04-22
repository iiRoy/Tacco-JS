(function(input) {
    var p = input.split('\n');
    var n = p.shift();
    var a = p.slice(0, n);
    var count = 0;
    var g = [];
    for (var i = 0;; i++) {
        var m = Math.pow(2, i);
        if (m > a.length) {
            break;
        }
        g.unshift(m);
    }
    sortShell(a, g);
    console.log(g.length);
    console.log(g.join(' '));
    console.log(count);
    console.log(a.join('\n'));

    function sortShell(a, g) {
        for (var i = 0; i < g.length; i++) {
            sortInsertion(a, g[i]);
        }

        function sortInsertion(a, g) {
            //console.log(a.join(' '));
            for (var i = g; i < a.length; i += g) {
                var v = a[i];
                var j = i - g;
                while (j >= 0 && a[j] > v) {
                    a[j + g] = a[j];
                    j -= g;
                    count++;
                }
                a[j + g] = v;
                //console.log(a.join(' '));
            }
        }
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));