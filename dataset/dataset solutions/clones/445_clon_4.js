'use strict'

const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n")
const numbers = input[1].trim().split(/\s+/).map(Number)

const n = numbers.length
const sum = numbers.reduce((acc, value) => acc + value, 0)
const squareSum = numbers.reduce((acc, value) => acc + value * value, 0)

const mean = sum / n

const clamp = value => Math.max(-100, Math.min(100, value))

const candidates = [
   clamp(Math.floor(mean)),
   clamp(Math.ceil(mean))
]

const calcCost = target => {
   return squareSum - 2 * target * sum + n * target * target
}

console.log(Math.min(...candidates.map(calcCost)))