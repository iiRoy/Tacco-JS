var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

while (line = lines.shift()) {
    var s = line.split(' ').map(function(a) { return parseInt(a); });
    var args = [
        + s[0] + s[1],
        + s[2] + s[3],
        + s[4] + s[5]
    ];
    var k = 0;
    for (var i = 0; i < args.length; i++) {
        k += Math.floor(args[i] / 3);
        args[i] %= 3;
    }
    k += Math.floor((args[0] + args[1] + args[2]) / 3);
    console.log(k);
}