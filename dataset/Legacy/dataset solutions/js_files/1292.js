var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = (input.trim()).split(/\n/g);
var rank;

for (var i = 0; i < lines.length; i++) {
    if (lines[i] === '-1 -1 -1') break;

    var line = lines[i].split(' ').map(Number),
        m = line[0],
        f = line[1],
        r = line[2];
    
    if (m === -1 || f === -1) rank = 'F';
    else if (80 <= m + f) rank = 'A';
    else if (65 <= m + f) rank = 'B';
    else if (50 <= m + f) rank = 'C';
    else if (30 <= m + f) {
        if (50 <= r) rank = 'C';
        else rank = 'D';
    }
    else rank = 'F';
    
    console.log(rank);
}