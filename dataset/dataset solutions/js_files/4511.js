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

const fn = (x) => {
    let ans = 1
    for(let i = 1; i<=x; i++){
        ans *= i
    } 
    return ans
}
const Main = () => {
    const [n, m ] = nextIntArray()
    if(Math.abs(n-m) > 1){
        console.log(0)
        return
    }
    const MOD = 1e9 + 7
    let ans = 1
    for(let i = 1; i<= n;i++){
        ans = (ans % MOD) * (i % MOD)
    }
    for(let i = 1; i<= m;i++){
        ans = (ans % MOD) * (i % MOD)
    }
    if(n == m){
        console.log(2*ans%MOD)
    } else {
        console.log(ans%MOD)
    }
}
Main()

