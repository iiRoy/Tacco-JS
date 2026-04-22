'use strict'

const Main = (input) => {
  const tmp = input.trim().split('\n')
  const [N, M, X] = tmp[0].split(' ').map(Number)
  const bookArr = []

  for (let j = 1; j <= N; j++) {
    const [price, ...skills] = tmp[j].split(' ').map(Number)
    bookArr.push({
      price,
      skills
    })
  }

  const priceArr = []

  for (let bit = 0; bit < (1 << N); bit++) {
    let row = []
    const skillSum = { price: 0, skills: new Array(M).fill(0) }

    for (let i = 0; i < N; i++) {
      if (bit & (1 << i)) {
        for (let j = 0; j < M; j++) {
          skillSum.skills[j] += bookArr[i].skills[j]
        }
        skillSum.price += bookArr[i].price
      }
    }
    if (skillSum.skills.every(n => n >= X)) {
      priceArr.push(skillSum.price)
    }
  }

  let result = priceArr.length ? priceArr.sort()[0] : -1
  console.log(result)
  return result
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'))