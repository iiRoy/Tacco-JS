function main(arg) {
  let a = arg.split("\n")[1].split(" ")
  let i = 0

  while (a.every(e => e % 2 == 0)) {
    i++
    a = a.map(e => e / 2)
  }
  console.log(i)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
