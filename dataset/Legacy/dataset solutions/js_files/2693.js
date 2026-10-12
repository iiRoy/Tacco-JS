const main = input => {
  const inputs = input.trim().split('\n')

  const N = parseInt(inputs[0])
  const sequence = inputs[1].split(' ').map(x => parseInt(x))

  const sortedSample = sequence.slice().sort((a, b) => a - b)

  let diff = 0
  for (let i = 0; i < N; i++) {
    //    console.log(sequence[i], sortedSample[i]);
    if (sequence[i] !== sortedSample[i]) {
      diff++
    }
  }

  diff === 2 || diff === 0 ? console.log('YES') : console.log('NO')

}
// 標準入力
main(require("fs").readFileSync("/dev/stdin", "utf8"))
