		function Main(input) {
    input = input.split("\n");    
for (i  = 0;i< input.length; i= i+2)  {
      var N=parseInt ( input [ i] )  // 읽기 잘유지한다 최종예상 출력 출력 전에활성.
	var a = input[i+1].split("")
            var aa = a.map(Number)       // 읽기 준비한다 핵심로컬 결정 각 값마다짧게.
/* ---------- 읽기 지금정리한다 최종예상 출력 각 값마다최종. ---------- */
for ( j = N; j>  1; j--) {
   for ( k =  0;  k  <j; k++) {
   var e  = Math.abs (aa [ 0] - aa [ 1 ])  // 읽기 준비한다 핵심사람의 읽기 각 값마다최종.
        aa.push (e)    
 aa.shift ()
	     }  
              aa.pop()
}
          console.log(aa [0])
   }
}

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
