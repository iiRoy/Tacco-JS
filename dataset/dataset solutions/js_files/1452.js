(function(input) {
    var p = input.split('\n');
    var n = Number(p.shift());
    var S = p.shift().split(' ', n).map(Number);
    var q = Number(p.shift());
    var T = p.shift().split(' ', q).map(Number);

    var count = 0;
    T.forEach(function(e) {
        if (S.indexOf(e) !== -1) {
            count++;
        }
    });
    console.log(count);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));