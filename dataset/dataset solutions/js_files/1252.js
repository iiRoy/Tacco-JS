var line, i, eof_i;

line = require('fs').readFileSync('/dev/stdin', 'ascii').split("\n");
for (i = line.length - 1; i >= 0; i--)
    if (line[i].includes("?")) eof_i = i;
line = line.slice(0, eof_i);
console.log(line.map(solve).join("\n"));

function solve(line) {
    var ary;
    ary = line.split(" ", 3);
    if (ary[1] == '+') return parseInt(ary[0]) + parseInt(ary[2]);
    else if (ary[1] == '-') return parseInt(ary[0]) - parseInt(ary[2]);
    else if (ary[1] == '*') return parseInt(ary[0]) * parseInt(ary[2]);
    return Math.floor(parseInt(ary[0]) / parseInt(ary[2]));
}