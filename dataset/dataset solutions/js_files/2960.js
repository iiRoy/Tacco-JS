"use strict"
const create = () => {
    const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    const res = {
        "list": input, "index": 0, "max": input.length,
        "hasNext": function() {return this.index < this.max},
        "next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
    };
    return res;
}
const o = create();
const next = () => o.next()
const nextInt = () => parseInt(o.next())
const nextStrArray = () => o.next().split(" ")
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")
const hasNext = () => o.hasNext()
const myout = (...x) => console.log(...x)
const calc = (n, k) =>{
    let cnt = 0
    while(n>k){
        n *= 2
        cnt++
    }
    return cnt
}
const Main = () => {
    const [N, K] = nextIntArray()
    let ans = 0
    for(let i = 1; i<=N; i++){
        const cnt = calc(i, K)
        ans += 1/N*(0.5**cnt)
    }
    console.log(ans)
}
Main()
