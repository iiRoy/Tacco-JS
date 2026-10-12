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
    const N = nextInt()
    const as = nextIntArray()
    let m = {}
    for(let el of as){
        if(!m[el]) m[el] = 1
        else m[el]++
    }
    const Q = nextInt()
    let bs = []
    let cs = []
    while(hasNext()){
        let [b,c] = nextIntArray()
        bs.push(b)
        cs.push(c)
    }
    let sum = 0
    for(let key of Object.keys(m)){
        sum = sum + m[key]*key
    }
    for(let i = 0; i<Q; i++){
        let from = bs[i]
        let to = cs[i]
        if(m[from] && m[to]){
            sum = sum - m[from]*from + m[from]*to
            m[to] = m[to] + m[from]
            m[from] = 0
        }else if (m[from] && !m[to]){
            sum = sum - m[from]*from + m[from]*to 
            m[to] = m[from]
            m[from] = 0
        }
        console.log(sum)
    }
}
Main()
