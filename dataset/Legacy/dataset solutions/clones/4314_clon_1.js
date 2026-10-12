 "use strict";
// ~~~~~~~~~~ 읽기 잘정리한다 최종예상 출력 각 값마다가까이. ~~~~~~~~~~
		const main = arg => {
arg = arg.trim().split("\n");
		const   N =  parseInt (arg [0] );



for (let  h =1;  h  <=  3500; h++){
       for (let n=1; n <=3500; n++){
     let w = (N * h * n) / (4 * h * n - N * n - N * h);



              if(w % 1 === 0) {   
// 읽기 또한유지한다 최종값 분석 각 값마다명확.
        console.log(h + " " + n + " " + w);
                  return ;    
            }
	 }
    }
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 읽기 준비한다 최종받은 데이터 출력 전에짧게.
