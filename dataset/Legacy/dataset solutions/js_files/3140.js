"use strict"

function Main(stdin){
stdin = stdin.trim().split("\n").reverse();
var stdout = [];
function input(){return stdin.pop()};
function print(x){stdout.push(x)};
function mapint(x){return x.map(n=>parseInt(n))};


var tmp = mapint(input().split(" "))
var n = tmp[0]
var m = tmp[1]
var c = tmp[2]
var b = mapint(input().split(" "))
var ans = 0


for (var i = 0; i < n; i++){
    var ai = mapint(input().split(" "))
    var s = c
    for (var j = 0; j < m; j++){ s += ai[j] * b[j] }
    if (s > 0){ ans++ }
}

print(ans)






stdout = stdout.join("\n");
console.log(stdout);
return stdout
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"))