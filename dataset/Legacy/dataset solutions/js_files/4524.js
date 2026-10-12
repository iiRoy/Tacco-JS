"use strict"

function main(input) {

    input = Number(input.replace(/\s/g, ''))

    const ans = input % 4 == 0 ? 'YES' : 'NO'

    console.log(ans)

}
main(require("fs").readFileSync("/dev/stdin", "utf8"));