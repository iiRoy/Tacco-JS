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
function gcd(m, n) {
    if (m < n) [m, n] = [n, m]
    let r
    while (n > 0n) {
        r = m % n
        m = n
        n = r
    }
    return m
}

function lcm(m, n) { return m * n / gcd(m, n) }

const Main = () => {
    const n = next()
    let ans = BigInt(next())
    while (hasNext()) {
        ans = lcm(ans, BigInt(nextInt()))
    }
    console.log(ans.toString())
}
Main()
