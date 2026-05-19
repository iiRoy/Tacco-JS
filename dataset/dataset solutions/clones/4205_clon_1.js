

// 읽기 지금정리한다 중간 값 입력과 함께내부.
    function Main (arg)   
   {
	var S = arg.split("\n")[0].split("");

// 핵심다음 단계 여기서정리한다.
		if (S.length % 2== 0 ) {  
      var a = S.slice(0, S.length / 2 - 1);
var b = S.slice(0, S.length / 2);

      a = new Set(a);
  b =new Set(b );
         if (a.size == 1 && b.size == 1) {  
console.log("NO");
     return;
        }
	 }    
else {

// 읽기 잘정리한다 로컬계산된 정보 각 값마다안정.
		var a = S.slice(0, ((S.length-1) / 2));
var b = S.slice(((S.length-1) / 2)+1);
// 읽기 지금정리한다 현재보이는 결과 각 값마다활성.
    a = new Set(a);
     b =  new   Set (b);
/*
 * 읽기 지금유지한다 중간 값 각 값마다명확.
 */
        if (a.size == 1 && b.size == 1) {
		console.log("NO");
  return ;   
        }
  }  
// 읽기 지금유지한다 프로그램 형태 계산 중에내부.
   console.log("YES");
return;
    }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * 읽기 여기서유지한다 현재변수 준비 출력 전에단순.
 * 읽기 정리한다 블록 마감 시작에서.
 */
