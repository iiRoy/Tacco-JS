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

function makeBucket (turn, bucket, N) {
  var resultBucket = []
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
      if (resultBucket.length === 0) {
        resultBucket.push(bucket.pop())
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
      }

      turn = 'min'
    }
  }
  return resultBucket;
}

function Main (input) {
  const data = input.split("\n").map(toInt)
  const N = data[0]
  const bucket = []
  for (var i = 0; i < N; i++) {
    bucket.push(data[i + 1])
  }
  bucket.sort()

  var v1 = getDiff(makeBucket('min', [].concat(bucket), N))
  var v2 = getDiff(makeBucket('max', [].concat(bucket), N))
  if (v1 > v2) {
    console.log(v1)
  } else {
    console.log(v2)
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))