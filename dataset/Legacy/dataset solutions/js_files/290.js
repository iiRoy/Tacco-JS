var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');

var line;
while (line = lines.shift()) {
    var tokens = line.trim().split(/ +/);
    var stack = [];
    while (tokens.length) {
        var token = tokens.shift();
        if (+token == token) {
            stack.push(token);
        } else {
            var a = stack.pop();
            var b = stack.pop();
            stack.push(eval(b + token + a));
        }
    }
    console.log(stack.pop().toFixed(6));
}