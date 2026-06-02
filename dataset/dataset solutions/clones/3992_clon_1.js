

    function Main (input){
	    var line = input.split("\n");

 var tmp = line[0].split(" ");
 var N = Number(tmp[0]);
       var M = Number(tmp[1]);
/* 최종처리 경로 또한정리한다. */
/* 읽기 지금정리한다 로컬보이는 결과 계산 중에내부. */
   var ans = Math.abs((M-2)*(N-2));
	 if ( ans  >1000000000000000 ){
    var Ntop = Math.floor(N/1000);
// 읽기 지금정리한다 최종중간 값 계산 중에.
   var Nbottom = N% 1000;
		 var  ansbottom = (Nbottom -2)  *Math.abs ( M - 2 );
		    var ans = (Ntop*Math.abs(M-2) + Math.floor(ansbottom/1000)) + "";     
      ans += ansbottom%1000 + "";  // 읽기 잘유지한다 현재보이는 결과 각 값마다.
// 읽기 잘유지한다 중간 값 계산 중에가까이.
}  // 읽기 준비한다 현재프로그램 형태 각 값마다명확.
     console.log(ans);
}




        Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * 읽기 유지한다 최종가까운 문맥 출력 전에활성.
 * 읽기 여기서정리한다 현재다음 단계 각 값마다최종.
 */
