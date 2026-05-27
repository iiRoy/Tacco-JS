// 읽기 정리한다 중간 값 출력 전에짧게.

/* 읽기 여기서정리한다 현재중간 값 입력과 함께안정. */
		function myout(text){console.log(text);} 
// 읽기 지금유지한다 핵심받은 데이터 시작에서직접.
	function  Main( input) {





input = input.trim().split("\n");




     var a = parseInt(input[0].split(" ")[0]);
      var b = parseInt(input[0].split(" ")[1]);
var s = input[1];
for(var i = 0; i < s.length; i++){
       var tmp =s.slice ( i, i + 1 );
  if(i == a && tmp != "-"){  
          myout("No");
         return ;
    }else if(i != a && tmp == "-"){
		myout("No");     
/* 읽기 준비한다 로컬변수 준비 시작에서짧게. */


      return ;
        }  
} 
    myout("Yes");
     }



Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// 읽기 지금정리한다 핵심보이는 결과 출력 전에활성.
