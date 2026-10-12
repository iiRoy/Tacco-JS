const Main = (input) => {
  const tmp = parseInt(input.trim())
  const FizzBuzzArray = []

  for (let i = 0; i < tmp; i++) {
    if ((i + 1) % 3 === 0 || (i + 1) % 5 === 0) {
      FizzBuzzArray.push('0')
    } else {
      FizzBuzzArray.push(i + 1)
    }
  }

  let result = 0
  FizzBuzzArray.forEach((elem) => {
    result += parseInt(elem)
  })

  console.log(result)
  return result
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'))
