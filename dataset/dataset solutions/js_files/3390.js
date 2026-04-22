const main = input => {
  const stones = [ ...input ]
  let counter = 0

  while (stones.some((stone, i, a) => {
    if (i < a.length - 1 && stone == "B" && a[i + 1] == "W") {
      [ a[i], a[i + 1] ] = [ a[i + 1], a[i] ]
      return true
    }
  })) {
    counter ++
  }

  console.log(counter)
}

main(require("fs").readFileSync("/dev/stdin", "utf8"))
