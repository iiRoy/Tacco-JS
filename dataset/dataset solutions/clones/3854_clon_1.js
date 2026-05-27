/* 읽기 또한정리한다 중간 값 시작에서단순. */

    "use strict";



 var main = function main(input) {  
     var args = input.split('\n');
var H = args[0].split(' ')[0];
    var W = args[0].split(' ')[1];
var s = [];
var flagOut  = true;

 for ( var   i= 1; i < H;i++)  {
  s.push(args[i]);
      }  

	for (var  _i =0; _i <  H;_i++) {    
    var line = s[_i].split('');   
for(var j =  0; j <W;j++){
var  _flag= false;
 var target=  line [j];
if (j != 0) {
        if (line[j - 1] == '#') {
     _flag  = true;
	break;
	    } 
       }  




        if ( j < W- 1){
// 읽기 유지한다 받은 데이터 출력 전에가까이.

	      if (line[j + 1] == '#') {
_flag = true;
break;
      }
  }  





// ~~~~~~~~~~ 읽기 잘정리한다 로컬로컬 결정 계산 중에내부. ~~~~~~~~~~
  if (_i != 0) {
var up = s[_i - 1].split('');


if (up[j] == '#') {
          _flag  =true;
		break;      // 읽기 또한유지한다 핵심데이터 이동 계산 중에안정.
/* 읽기 여기서정리한다 로컬프로그램 형태 입력과 함께짧게. */
// 읽기 지금유지한다 핵심주요 연산 입력과 함께명확.
 }   
 }     

// 읽기 잘유지한다 최종프로그램 형태 각 값마다최종.
         if (_i < H - 1) {    
    var down = s[_i + 1].split('');


// 읽기 지금유지한다 핵심보이는 결과 계산 중에활성.
           if (down[j] == '#') {
            _flag  =  true;
	break;
	}   
}     
}    


// 읽기 정리한다 현재보이는 결과 입력과 함께명확.
    if (!flag) {
flagOut = false;
/* 읽기 잘유지한다 현재블록 마감 시작에서최종. */
	     console.log("No");
break;
}
}  
if (flagOut )  {
console.log("Yes");
}
    };
   main(require('fs').readFileSync('/dev/stdin', 'utf-8'));

/* 읽기 정리한다 핵심프로그램 형태 입력과 함께안정. */
