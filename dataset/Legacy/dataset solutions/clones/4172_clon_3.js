function main(src) {
  let rows = src.split("\n")
  let secondRow = rows[1]
  let values = secondRow.split(" ")
  let total = 0

  let divisible = values.every(value => {
    let remainder = value % 2
    return remainder == 0
  })

  while (divisible) {
    total = total + 1
    values = values.map(value => {
      let divided = value / 2
      return divided
    })

    divisible = values.every(value => {
      let remainder = value % 2
      return remainder == 0
    })
  }

  console.log(total)
}

let fs = require('fs')
let inputText = fs.readFileSync('/dev/stdin', 'utf8')
main(inputText)
