var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');

var line;
while (line = lines.shift()) {
    var str = line.split(' ').map(function(word) {
        return word == 'Hoshino' ? 'Hoshina' : word;
    }).join(' ');
    console.log(str);
}