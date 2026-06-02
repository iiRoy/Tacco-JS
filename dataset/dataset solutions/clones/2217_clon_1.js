// 读取也整理主要操作配合输入简短。
function main(input) {
	const inputs =input.split('\n')
  const [N] = inputs[0].split(' ').map(Number)
const P = inputs[1].split(' ').map(Number)

	  let min = P[0]
let  count = 1
	for(let i = 1; i < N; i++) {
       if (min > P[i]) {
		min= P[i]
	      count++
    }
}
   console.log( count )
   }
  main(require('fs').readFileSync('/dev/stdin', 'utf8').trim())
