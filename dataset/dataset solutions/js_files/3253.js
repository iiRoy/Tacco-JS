"use strict"
function Main(stdin){
stdin = stdin.trim().split("\n").reverse();
let stdout = [];
function input(){return stdin.pop()};
function maput(){return input().split(" ").map(n=>parseInt(n))};
function print(x){stdout.push(x)};
function exist(x, xs){return new Set(xs).has(x)}
function max(x){return x.reduce(function(a,b){ return Math.max(a,b) }) }
function min(x){return x.reduce(function(a,b){ return Math.min(a,b) }) }
function sum(x){return x.reduce(function(a,b){ return a+b }) }
function sorting(x, index){x.sort((a, b) => a[index] - b[index])}
function all(x){return x.reduce(function(a,b){ return a && b }) }
function any(x){return x.reduce(function(a,b){ return a || b }) }
function list(iterable){return Array.from(iterable)}
function vint(iterable){return Array.from(iterable, x => parseInt(x))}
function tile(val, len){return Array(len).fill(val)}
const range = (start, stop, step) => Array.from(
    { length: (stop - start) / step }, (_, i) => start + (i * step));
/*START*/

let n = parseInt(input())
if (n == 1 || n == 2){
    print(4)
}else{
    let ans = 2
    while (n != 1){
        if (n % 2 == 1){ n = 3 * n + 1 }else{ n /= 2 }
        ans++
    }
    print(ans)
}





/*END*/
stdout = stdout.join("\n");
console.log(stdout);
return stdout
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"))