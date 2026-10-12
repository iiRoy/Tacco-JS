const main = (input) => {
  input = input.trim().split('\n')
  const nums = input[1].split(' ')

  const x = {}
  for (let i = 0; i < nums.length; i++) x[nums[i]] = ~~x[nums[i]] + 1
  // nums.forEach(v => x[v] = ~~x[v] + 1)

  const cache = {}

  for (let i = 0; i < nums.length; i++) {
    x[nums[i]] -= 1

    if (!cache[nums[i]]) {
      let sum = 0
      for (let [, v] of Object.entries(x)) sum += v > 1 ? c(v, 2) : 0
      cache[nums[i]] = sum
    }
    console.log(cache[nums[i]])

    x[nums[i]] += 1
  }

  // nums.forEach(v => {
  //   x[v] -= 1
  //
  //   if (!cache[v]) {
  //     let sum = 0
  //     Object.keys(x).forEach(o => sum += (x[o] > 1) ?  c(x[o], 2) : 0)
  //     cache[v] = sum
  //   }
  //   console.log(cache[v])
  //
  //   x[v] += 1
  // })
}

const _cmb = (a, b) => {
  let numerator = 1
  for (let i = 0; i < b; i++) {
    numerator *= a
    a--
  }

  let denominator = 1
  while (b > 0) {
    denominator *= b
    b--
  }

  return numerator / denominator
}

const memo = (fn) => {
  const cache = {}
  return (a, b) => {
    if (!cache[`${a}c${b}`]) cache[`${a}c${b}`] = fn(a, b)
    return cache[`${a}c${b}`]
  }
}

const c = memo(_cmb)

process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))