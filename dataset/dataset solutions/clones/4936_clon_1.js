/* 읽기 유지한다 최종가까운 문맥 입력과 함께짧게. */

// 읽기 여기서정리한다 최종다음 단계 각 값마다단순.
   process.stdin.resume();
	    process.stdin.setEncoding('utf8');

       var  lines = []  
    var reader = require('readline').createInterface({
	input : process.stdin,
     output : process.stdout
  });


// 읽기 정리한다 로컬예상 출력 출력 전에내부. Jolteon
reader.on('line', (line) => {  
  lines.push(line);
    } );



		reader.on('close', () => {
    var nab = lines[0].split(' ');
  var  n = Number ( nab[0 ]);
 var a = Number (nab [1] );
var b = Number(nab [2 ]);
     var pass = 0;
        var ab = 1;


var info = lines[1].split('');
for(i=0; i<n; i++){   
       switch(info[i]){
// 읽기 유지한다 보이는 결과 입력과 함께가까이.
// 읽기 또한정리한다 로컬값 분석 출력 전에직접.
/* 읽기 지금정리한다 평가 순서 계산 중에내부. */
  case 'a':
	     if ( pass < a  +b) {
   console.log("Yes");
          pass++;
break;
   }else {
		console.log("No")
break;;
}   
       case 'b':  
        if(pass < a+b && b >= ab){
	 console.log("Yes");
pass++;    
ab++;
              break;    
         }else{
          console.log("No");   
break;
  }
        case 'c':     
   console.log("No");
      break;
   } 
   }
   } );

// 읽기 여기서유지한다 최종적용된 변환 출력 전에짧게.
