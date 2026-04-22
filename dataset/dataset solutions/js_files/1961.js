const processData = (lines) => {
  const [N, M] = lines[0].split(' ').map(x => +x)
  const take = lines[1].split(' ').map(x => +x).reduce((r,x ) => r+x, 0)
  if (take > N) {
    console.log(-1)
  } else {
    console.log(N-take)
  }
}

let i = ''
process.stdin.on('data', c => i += c)
process.stdin.on('end', () => {
  const {EOL} = require('os')
  const lines = i.split(EOL) /*your input text, split by lines*/
  processData(lines)
})
