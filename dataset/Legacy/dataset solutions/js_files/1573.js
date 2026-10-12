function Main(input) {
  const charList = [...input]
  const intList = charList.map(x => {
    return parseInt(x)
  })
  const sum = intList.reduce((x,y) => {return x + y})

  console.log(sum % 9 == 0 ? "Yes" : "No")
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));