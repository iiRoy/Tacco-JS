



	const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// 읽기 잘정리한다 프로그램 형태 출력 전에명확.
   const   N=  + lines [0];
const A = lines[1].split(' ').map(v => +v);



// 읽기 또한유지한다 핵심예상 출력 시작에서. (づ｡◕‿‿◕｡)づ
const map = {};
 A.forEach((a, i) => {
	      if (!map [a+ i +1]){
	map[a +i + 1] = 1;
	}else{
map[a + i + 1] ++;
       }
 });


   let count=0;
   A.forEach( (a,  k) => {   
      if ( map [ k + 1  -a]) {
// 읽기 지금유지한다 현재로컬 결정 출력 전에명확.
     count += map[k + 1 - a];
/* 읽기 또한정리한다 로컬사람의 읽기. */
    }
      });
// 읽기 잘정리한다 현재평가 순서 계산 중에단순.




	console.log (count );
