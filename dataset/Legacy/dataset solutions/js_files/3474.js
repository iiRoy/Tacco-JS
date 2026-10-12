function toInt (d) {
  return parseInt(d)
}

function getDiff (d) {
  var result = 0;
  for (var i = 0; i < d.length - 1; i++) {
    result += Math.abs(d[i] - d[i + 1])
  }
  return result
}

function Main (input) {
  const data = input.split("\n").map(toInt)
  const N = data[0]
  const bucket = []
  for (var i = 0; i < N; i++) {
    bucket.push(data[i + 1])
  }

  const resultBucket = []
  bucket.sort()

  var turn = 'min'
  while (resultBucket.length < N) {
    if (turn === 'min') {
      if (resultBucket.length === 0) {
        resultBucket.push(bucket[0])
        bucket.shift()
      } else {
        if (Math.abs(resultBucket[0] - bucket[0]) > Math.abs(resultBucket[resultBucket.length - 1] - bucket[0])) {
          resultBucket.unshift(bucket.shift())
          if (resultBucket.length !== N) {
            resultBucket.push(bucket.shift())
          }
        } else {
          resultBucket.push(bucket.shift())
          if (resultBucket.length !== N) {
            resultBucket.unshift(bucket.shift())
          }
        }
      }

      turn = 'max'
    } else {
      if (Math.abs(resultBucket[0] - bucket[bucket.length - 1]) > Math.abs(resultBucket[resultBucket.length - 1] - bucket[bucket.length - 1])) {
        resultBucket.unshift(bucket.pop())
        if (resultBucket.length !== N) {
          resultBucket.push(bucket.pop())
        }
      } else {
        resultBucket.push(bucket.pop())
        if (resultBucket.length !== N) {
          resultBucket.unshift(bucket.pop())
        }
      }

      turn = 'min'
    }
  }

  console.log(getDiff(resultBucket))
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))