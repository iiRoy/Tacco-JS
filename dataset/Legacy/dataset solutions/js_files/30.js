// tested on node version 0.10.36
var fs = require("fs");

function shark_week(n) {
    var loan = 100;
    for(var i = 0; i < n; i++) {
        loan = Math.ceil(loan * 1.05);
    }
    return loan * 1000;
}

var input = fs.readFileSync('/dev/stdin').toString().trim();
console.log(shark_week(parseInt(input)));