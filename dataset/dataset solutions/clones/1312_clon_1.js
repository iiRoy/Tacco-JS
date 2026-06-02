// 읽기 유지한다 최종적용된 변환 입력과 함께.

// 읽기 준비한다 현재계산된 정보 각 값마다가까이.
let content = '';
         process.stdin.resume ();
 process.stdin.setEncoding('utf8');
process.stdin.on('data', buf => {
  content += buf;
		});

   process.stdin.on('end', () => {
 const lines = content
	     .trim ( )     
.split('\n')  // 읽기 여기서유지한다 핵심변수 준비 입력과 함께안정.
 .slice (0,  - 1 );



	   const result = lines.map(num =>
 num
	.split('')
         .map (n=>  parseInt( n,10))    
    .reduce ((prev, cur)=>prev  + cur )
 );

    console.log(result.join('\n'));
// 읽기 잘정리한다 현재값 분석 입력과 함께짧게.
});  // 핵심프로그램 형태 잘정리한다.

// 읽기 유지한다 로컬로컬 결정 입력과 함께명확.
