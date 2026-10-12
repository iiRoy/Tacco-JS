const Main = (input) => {
  const line = input.split('\n')
  const weathers = line[0].toString().split('')
  let count = 0

  weathers.reduce((prev, wether) => {
    if (prev === 'R' && wether === 'R') count++
    if (prev === '' && wether === 'R') count++
    return wether
  }, '')

  console.log(count)
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'))