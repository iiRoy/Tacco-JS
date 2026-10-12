// tested on node version 0.10.36
var fs = require("fs");
function is_right(a, b, c) {
    return a*a + b*b === c*c;
}
var input = fs.readFileSync('/dev/stdin').toString();
var lines = input.split("\n");
var count = parseInt(lines.shift());
for(var i = 0; i < count; i++) {
    var parts = lines[i].split(" ");
    var a = parseInt(parts.shift());
    var b = parseInt(parts.shift());
    var c = parseInt(parts.shift());
    if(!isNaN(a + b + c)) {
        console.log(is_right(a, b, c) ? "YES" : "NO");
    }
}