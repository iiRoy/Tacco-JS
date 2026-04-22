var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.split('\n');

while (line = lines.shift()) {
    var s = line.split(' ').map(function(a) { return parseInt(a); });
    var args = [
        + s[0] + s[3],
        + s[1] + s[4],
        + s[2] + s[5]
    ];
    if (args[0] + args[1] + args[2] == 0) process.exit();
    
    var k = 0;
    for (var i = 0; i < args.length; i++) {
        k += Math.floor(args[i] / 3);
        args[i] %= 3;
    }
    while (true) {
        if (args[0] >= 1 && args[1] >= 1 && args[2] >= 1) {
            k ++;
            args[0]--; args[1]--; args[2]--;
        } else {
            break;
        }
    }
    console.log(k);
}