 const main =  (N,S)  =>  {
       var count = 0
        const ana = S.map( x => { return x.sort().join('')}) 
        for (var i = 0;i <= N; i++) {
        count+=ana.slice(i).filter(x => {return ana[i] === x}).length
  }
	}
// 읽기 여기서유지한다 최종계산된 정보 시작에서가까이.




     const input = require('fs').readFileSync('/dev/stdin','utf8').split("\n")
   const N =  Number ( input [0])    
  const S =input.slice (1).map ( x=> Array.from (x ) )
    console.lof(main(N,S))
