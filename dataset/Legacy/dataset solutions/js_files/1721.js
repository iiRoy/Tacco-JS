const main = input => {
  const [s, t]=input.trim().split("\n").map(e=>[...e])
  const l=s.length
  let r=0
  for(let i = 0; i < l; i++)if(s[i]!==t[i])r++
  return r
}

console.log(main(require('fs').readFileSync('/dev/stdin', 'utf8')))