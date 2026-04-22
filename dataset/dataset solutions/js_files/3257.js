'use strict'

function Main(input) {
  // 左から数えていって、花の本数をカウントしていく
  // もし、左隣りの本数より少ない場合はカウントしない
  const lines = input.split('\n')
  const N = parseInt(lines[0])
  const hs = lines[1].split(' ').map(Number)

  let pre = 0
  let count = 0
  // 左から数えていって、花の本数をカウントしていく
  hs.forEach(h => {
    if (h < pre) {
      // もし、左隣りの本数より少ない場合はカウントしない
      pre = h
      return
    }
    // 左隣りより本数が多い場合は、その分カウントする
    count += h - pre
    pre = h
  })
  console.log(count)
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// Main(`6
// 3 1 2 3 1 3`)
