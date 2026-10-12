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
const Main = () => {
    const X = nextInt()
    const max = 1000000
    const p = new Array(max).fill(true)
    for(let i = 4;i<max;i=i+2){
        p[i] = false
    }
    p[1] = false
    p[0] = false
    for(let i = 3; i<max; i=i+2){
        if(p[i] == false) continue
        for(let j=2;i*j<max;j++){
            p[j*i] = false
        }
    }
    for(let i = X; i<max;i++){
        if(p[i] == true){
            console.log(i)
            return
        }
    }
}
Main()
