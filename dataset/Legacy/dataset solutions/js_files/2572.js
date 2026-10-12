"use strict"

const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const args_lines = arg_str.split('\n')
const n = args_lines[0]

console.log(n*n*n)