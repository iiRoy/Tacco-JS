var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = (input.trim()).split("\n");
var n = Arr.shift() - 0;
var before = "";
var s = [];
for (var i = 0; i < n; i++) {
    var arr = Arr[i].split(" ");
    var a = arr[0];
    var b = arr[1] - 0;
    if (i == 0 && a == ")") return console.log("NO");
    if (before == a) {
        s[s.length - 1] += b;
    } else {
        if (a == ")") {
            var z = s[s.length - 1];
            if (z > b) {
                s[s.length - 1] -= b;
            }
            if (z < b) {
                s.pop();
                s.pop();
                s.push(a);
                s.push(b - z);
            }
            if (z == b) {
                s.pop();
                s.pop();
            }
        } else {
            s.push(a);
            s.push(b);
            before = a;
        }
    }
}
if (s.length == 0) {
    console.log("YES");
} else {
    console.log("NO");
}