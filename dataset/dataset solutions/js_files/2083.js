'use strict'

const main = (arg) => {
  const S = arg.split('\n')[0]
  if (S.includes('hi')) {
    console.log('Yes')
  } else {
    console.log('No')
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))
