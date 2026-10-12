var input = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);

for (var row = 0; row < input.length; row++) {
    var tokens = input[row].split(/\s/);
    var stack = [];

    for (var i = 0; i < tokens.length; i++) {
        var c = tokens[i];

        if (c === '+') {
            var r1 = stack.pop();
            var l1 = stack.pop();
            stack.push(l1 + r1);
        } else if (c === '-') {
            var r2 = stack.pop();
            var l2 = stack.pop();
            stack.push(l2 - r2);
        } else if (c === '*') {
            var r3 = stack.pop();
            var l3 = stack.pop();
            stack.push(l3 * r3);
        } else if (c === '/') {
            var r4 = stack.pop();
            var l4 = stack.pop();
            stack.push(l4 / r4);
        } else {
            stack.push(isNaN(c) ? 0 : parseFloat(c).toFixed(6));
        }
    }

    console.log(stack[0]);
}