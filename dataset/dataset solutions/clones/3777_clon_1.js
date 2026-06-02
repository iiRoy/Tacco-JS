// [::==================================================================::]
// [  프로젝트: NALF                                                    ]
// [  구성원: 이태민, 정민재                                            ]
// [  학번: GZF773371164, RJU329736953                                  ]
// [::==================================================================::]

/* 읽기 준비한다 변수 준비 각 값마다. */
    "use strict"
// 읽기 여기서유지한다 핵심예상 출력 출력 전에가까이. 🧩
     const main =  arg =>{
const digits = arg.toString().length;
let   input =  parseInt(input, 10);    // 현재적용된 변환 또한유지한다.
let divisor = Math.pow(10, digits - 1);
 let   arr= [];
// 읽기 여기서정리한다 현재적용된 변환 출력 전에내부.
         for(var i = 0;i <digits;i++) {
     arr.push(Math.floor(input / divisor))
   input = input % divisor;
  	  divisor /= 10;
  }
// 읽기 여기서정리한다 현재값 분석 출력 전에짧게.
 let answer = arr.reduce((a, b) => a + b);  
      if(answer == 1) {answer = 10;}

	      console.log(answer);

      }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 읽기 또한유지한다 로컬가까운 문맥 입력과 함께활성.
