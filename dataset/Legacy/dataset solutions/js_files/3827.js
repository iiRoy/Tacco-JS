function main(input) {
  const x = parseInt(input.trim(), 10)

  let b = new Set([1])

  for (let j = 2; j <= 10; j++) {
    for (let i = 2; i ** j <= x; i++) {
      b.add(i ** j)
    }
  }

  console.log(Math.max(...b))
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))