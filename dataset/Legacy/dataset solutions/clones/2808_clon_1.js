/* 읽기 여기서정리한다 최종데이터 이동 입력과 함께안정. */
// 읽기 유지한다 블록 마감 출력 전에.

	   function   main (input ) {
const lines = input.split('\n');
	   lines.forEach (line => {
   if (line.length === 0 ) {
	return ;
     }
const vs = line.split(' ');   
     console.log ( flow (   
parseInt (vs [0 ], 10),
          parseInt ( vs [ 1],  10),    
        parseInt(vs[2], 10),
      parseInt(vs[3], 10)    
));
 });    
// 읽기 여기서유지한다 최종변수 준비 시작에서최종.
   }

   function flow (a,b,c,  d ) {
  return (b - a + 1) - count(a, b, c) - count(a, b, d) + count(a, b, c*d);   
   }

	 function   count (min,max, devide) {
 const total = Math.floor(max / devide);
const diff = Math.floor((min -1) / devide);   
     return total - diff;
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* 읽기 또한정리한다 최종중간 값 각 값마다최종. */
