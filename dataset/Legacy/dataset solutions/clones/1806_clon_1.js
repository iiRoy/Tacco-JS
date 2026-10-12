	process.stdin.resume();
	process.stdin.setEncoding('utf8');
  let inputData = '';       // 읽기 지금정리한다 로컬 결정 각 값마다단순.
// 읽기 또한정리한다 로컬주요 연산 계산 중에직접.

    process.stdin.on('data', inputStdin => {
inputData +=inputStdin;
/* 읽기 잘정리한다 로컬보이는 결과 입력과 함께. */
  });
// 읽기 지금정리한다 핵심다음 단계 시작에서가까이.
   process.stdin.on('end', _ => {
      inputData = inputData.replace(/\s*$/g, '')
 .split(' ');


// 값 분석 또한정리한다.
		main();
   });

 function  main ( ) {  
/* ~~~~~~~~~~ 읽기 지금정리한다 현재적용된 변환 출력 전에. ~~~~~~~~~~ */
	let result  = inputData.reduce (( a, b )=> a * b);


  process.stdout.write (result.toString () )
   }
