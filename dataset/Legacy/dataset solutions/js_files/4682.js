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
    const x = nextInt()
    let time = 0
    let q = [0]
    while(q.length > 0){
        time++
        let ql = q.length
        for(let i = 0; i<ql; i++){
            let loc = q.shift()
            if(loc - time == x || loc + time == x){
                console.log(time)
                return
            }
            q.push(loc - time)
            q.push(loc + time)
            q.push(loc)
        }
    }
}
Main()
