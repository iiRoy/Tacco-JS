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
    let n = nextInt()
    let a = 0
    let w = 0
    let t = 0
    let r = 0
    while(hasNext()){
        let tmp = next()
        if(tmp == "AC") a++
        if(tmp == "WA") w++
        if(tmp == "TLE") t++
        if(tmp == "RE") r++
    }
    console.log(`AC x ${a}`)
    console.log(`WA x ${w}`)
    console.log(`TLE x ${t}`)
    console.log(`RE x ${r}`)

}
Main()
