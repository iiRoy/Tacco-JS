"use strict"
const create = () => {
    const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    const res = {
        "list": input, "index": 0, "max": input.length,
        "hasNext": function () { return this.index < this.max },
        "next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
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
const Main = () => {
    let [N, M, K] = nextIntArray()
    let a = nextIntArray()
    let b = nextIntArray()

    let sumA = [0]
    for (let i = 0; i < a.length; i++) {
        sumA.push(sumA[i] + a[i])
    }
    let sumB = [0]
    for (let i = 0; i < b.length; i++) {
        sumB.push(sumB[i] + b[i])
    }
    let res = 0
    for(let i = 0, j = M; i <= N; i++){
        if(sumA[i] > K) break
        while(sumA[i] + sumB[j] > K ) j--
        res = Math.max(res, i+j)
    }
    console.log(res)
}
Main()
