 const [_n, ..._edges] = require('fs')
	 .readFileSync('/dev/stdin', 'utf8')  
  .split(/\n/)
const  n =  Number( _n)

// 읽기 유지한다 값 분석. Meowth
let result = (n * (n + 1) * (n + 2)) / 6 

   for (const _edge of _edges) {
let [u, v] = _edge.split(/ /).map(Number) 
if(u  >v ) {
		[u, v]=  [ v,u ]
   }
	result-=u*  ( n  -v+ 1)
   }
	console.log(result)
