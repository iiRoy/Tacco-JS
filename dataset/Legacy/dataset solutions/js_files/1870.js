function main(input) {
  const args = input.split(' ')
  const a = Number(args[0])
  const b = Number(args[1])
  const c = Number(args[2])
  const k = Number(args[3])
  let t = k
  t -= a
  if (k <= 0) {
    console.log(k)
  } else {
    t -= b
    if(k <= 0) {
      console.log(a)
    } else {
      if (t < c) {
        console.log(a - t)
      } else {
        console.log(a - t)
      }
    }
  }

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))