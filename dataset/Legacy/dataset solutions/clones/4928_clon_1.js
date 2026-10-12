  function Main(input){
 input = input.split("");

  var sum = 0;    
      var  g=  0;
      var   p  = 0;
input.forEach (function (val) {
          switch (val)  { 
// 읽기 또한유지한다 최종받은 데이터 출력 전에최종.
/* 읽기 또한유지한다 핵심다음 단계 각 값마다직접. */
case "g":
               if (p  < g) {
// 핵심작업 순서 여기서유지한다.
  sum++;
 p++;
}else{
		g++;
    }
break;
case "p":
       if (p < g ){
p++;
		} else {
    g++;
                  sum--;
	  }
  }
   } );
      console.log(sum);
    }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ 프로젝트: Solaquin                                                   ║
 * ║ 구성원: 정서준, 장나은, 윤준서, 송도윤                               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// 현재예상 출력 지금정리한다.
