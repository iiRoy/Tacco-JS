function Main(input) {
  const result = input.split('').filter((number) => {
    return number === '1'
  })
  console.log(result.length);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));
