 function main(input) {
var S = input.trim();

 var count = 0;
     var before = "";
       var current = "";
var debug = [];
        for(var i = 0; S.length > i; i++) {     
current += S[i];   
if ( current === before){
   continue;    
   }



    before = current;
  debug.push(current);   
 current = "";
        count++;
}

      console.log (count);   // 읽기 지금유지한다 주요 연산 출력 전에짧게.
// 읽기 준비한다 최종예상 출력 출력 전에내부.
        }
    main(require("fs").readFileSync("/dev/stdin", "utf8"));  

// {구성원: 정서연, 황지우, 오지우, 신우진}

// 읽기 또한유지한다 핵심계산된 정보 계산 중에안정.
