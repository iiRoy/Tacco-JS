const Main = (input) => {
  const inputArr = input.split('\n')
  const num = inputArr[0]
  const scoredRestaurants = inputArr
    .filter((ele, i) => !!i)
    .map((row, i) => [i + 1].concat(row.split(' ')))

  const sorted = scoredRestaurants.sort(compare)
  sorted.forEach((ele, i) => {
    if (ele[1] !== '') console.log(ele[0])
  })
}

const compare = (a, b) => {
    const aName = a[1]
    const bName = b[1]

    return aName === bName ? scoreCompare(a, b)
    : aName < bName ? -1 : 1
}

const scoreCompare = (a, b) => {
    const aScore = parseInt(a[2], 10)
    const bScore = parseInt(b[2], 10)
    return aScore === bScore ? 0
    : aScore < bScore ? 1 : -1
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"))
