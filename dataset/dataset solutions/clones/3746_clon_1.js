// 읽기 유지한다 최종보이는 결과 각 값마다활성.
	function Main(input){   
 input = input.split(' ');
 if(input[0] <= 8 & input[1] <=8){
   console.log('Yay!');  
    }else{
/* 읽기 정리한다 핵심사람의 읽기 계산 중에활성. */
  console.log(':(');
  } 
   }  


	Main(require("fs").readFileSync("/dev/stdin","utf8"));
