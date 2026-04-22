function main(N, S) {
  if (N%2 !== 0) {
  	console.log('No')
  }
  a = S.slice(0,N/2)
  b = S.slice(N/2, N)
  if (a == b) {
    console.log('Yes')
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));