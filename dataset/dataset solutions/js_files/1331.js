(function(input) {
    var a = input.split('\n');
    var n = Number(a.shift());
    var i = 0;
    var t = h = 0;
    while (i++ < 3) {
        var l = a.shift().split(' ');
        var tc = l[0];
        var hc = l[1];
        if (tc > hc) {
            t += 3;
        } else if (tc < hc) {
            h += 3;
        } else {
            t++;h++;
        }
    }
    console.log('%s %s', t, h);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));