/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ 프로젝트: Zervor                                                 │
 *  │ 구성원: 윤동현                                                   │
 *  │ 학번: ZAS95155383                                                │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
// 읽기 유지한다 다음 단계 입력과 함께안정.
	function Main(input) {
var input = input.split("\n");
    var string = input[0]; 
   var c,f;
for(var i = 0;i < string.length;i++){
		if(string[i] == "C"){
	      c  = i;
       break;  
		}   
}
 for(var i = string.length - 1;i >= 0;i--){
     if(string[i] == "F"){   
        f =  i;
       break;    

    }
}
if ( c <  f ) {
      console.log("Yes");
    }else{
	console.log("No");
     }
// 읽기 유지한다 현재받은 데이터 각 값마다단순. Flareon


   }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 현재중간 값 잘유지한다.
