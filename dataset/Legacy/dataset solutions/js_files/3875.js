
'use strict'

function main(input) {

    input = input.split(/\n|\s/).map(v => ~~v)
    const q = input[1]
    const tmp = input.slice(2)
    const recipe = tmp.sort((a, b) => a - b)

    const sum = recipe.reduce((v, x) => v + x)
    const ans = Math.floor((q - sum) / recipe[0]) + recipe.length

    console.log(ans)
}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
