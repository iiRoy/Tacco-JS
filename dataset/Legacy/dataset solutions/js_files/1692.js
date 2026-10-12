const [n, ...ss] = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/)
const result = {}
for (const s of ss) {
  result[s] = (result[s] || 0) + 1
}
for (const k of ['AC', 'WA', 'TLE', 'RE']) {
  console.log(`${k} x ${result[k]}`)
}