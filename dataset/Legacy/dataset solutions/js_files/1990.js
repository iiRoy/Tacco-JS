

        // if (j - i === k - j) {
        //   continue
        // }
        // if (S[i] !== S[j] && S[j] !== S[k] && S[i] !== S[k]) {
        //   count++
        // }

function main(input) {
  const inputs = input.split('\n')
  const N = Number(inputs[0])
  const S = inputs[1]
  const R = [], G = [], B = []
  S.split('').forEach((e, i) => {
    if (e === 'R') {
      R.push(i)
    } 
    if (e === 'G') {
      G.push(i)
    } 
    if (e === 'B') {
      B.push(i)
    } 
  })
  // console.log(R, G, B)

  // 貪欲
  // {
  //   let count = 0
  //   for(let i = 0; i < N - 2; i++) {
  //     for(let j = i + 1; j < N - 1; j++) {
  //       if (S[i] === S[j]) continue
  //       const ji = j - i
  //       for (let k = j + 1; k < N; k++) {
  //         if (S[j] === S[k]) continue
  //         if (k - j === ji) continue
  //         if (S[i] === S[k]) continue
  //         console.log('rgb:', i, j, k)
  //         count++
  //       }
  //     }
  //   }
  //   console.log('greedy:', count)
  // }

  let count = R.length * B.length * G.length
  // console.log(count)
  let notCount = 0
  for(let i = 0; i < N; i++) {
    for(let j = i + 1; j < N-1; j++) {
      const k = j * 2 - i
      if (k < N) {
        // console.log(i, j, k, S[i], S[j], S[k])
        if (S[i] !== S[j] && S[j] !== S[k] && S[i] !== S[k]) {
          // console.log('not count')
          notCount++
        }
      }
    }
  }

  console.log(count - notCount)

}
main(require("fs").readFileSync("/dev/stdin", "utf8"));
