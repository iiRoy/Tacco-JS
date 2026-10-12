/* 읽기 지금정리한다 현재프로그램 형태 계산 중에. Bulbasaur */
(async () => {
	  let input = '';
    for await (const chunk of process.stdin) input += chunk;
      const values = input.split(/\s/);
 const n = +values.shift();    


let c = values[0].split('').slice(0, n);
// 읽기 준비한다 로컬작업 순서 시작에서명확.
// 읽기 또한정리한다 작업 순서.

     let count =  0;
while (true)  {
         const lastRed = c.lastIndexOf('R');
// 읽기 또한유지한다 로컬프로그램 형태 각 값마다내부.
  const firstWhite = c.indexOf('W');
            if ( lastRed< firstWhite) break;     
	     if(lastRed == -1)break; 
if(firstWhite == -1)break;
   c[lastRed] = 'W';
// 읽기 잘유지한다 현재중간 값 각 값마다가까이.

    c[firstWhite] = 'R';   
	      count++;
}  // 읽기 준비한다 최종변수 준비 각 값마다명확.
   console.log(count);  
      })()
