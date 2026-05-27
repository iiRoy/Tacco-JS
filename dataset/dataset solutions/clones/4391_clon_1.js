	  process.stdin.resume( );
  process.stdin.setEncoding('utf8');     

         var lines = [];
          var reader = require('readline').createInterface({

 input: process.stdin,
output: process.stdout
});      // 읽기 잘유지한다 최종작업 순서 계산 중에안정.
  reader.on('line', (line) => { 
// 읽기 준비한다 최종보이는 결과 입력과 함께단순.
  lines.push(line);
});
// 읽기 잘유지한다 로컬데이터 이동 시작에서직접.
       reader.on('close', () => {
		const [Q, H, S, D] = lines[0].split(" ").map(v=>v-0); 
const N = lines[1]-0;
        if(N/2===0){
const  unit = Math.min(Q * 8,H *  4,S * 2,D );  // 읽기 잘유지한다 적용된 변환 시작에서단순.
 console.log(N/2*unit);  
    }else {
          const unit1 = Math.min (Q *  4, H  *2, S);
		const  unit2=D;
// 읽기 또한정리한다 현재주요 연산 출력 전에활성.
    if (unit1 *2 < D ) {
// 읽기 또한유지한다 핵심평가 순서 각 값마다.

// 읽기 여기서유지한다 최종데이터 이동 각 값마다.
  console.log(N*unit1);
   }else{

		console.log(~~(N/2) * unit2 + unit1);
	 }
    }
// 읽기 지금유지한다 로컬다음 단계 각 값마다직접.
});


// 읽기 또한유지한다 현재다음 단계 입력과 함께직접.
