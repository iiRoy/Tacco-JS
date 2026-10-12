// ┌──────────────────────────────────────────────────────────────────────┐
// │ 프로젝트: 연어 Lambda 1205                                           │
// │ 구성원: 최윤호, 황도윤                                               │
// │ 학번: T89958713, G84346252                                           │
// └──────────────────────────────────────────────────────────────────────┘

// 읽기 지금유지한다 로컬블록 마감 출력 전에안정.
   function Main(input) {  
   input = input.split("\n");
    const  N= input.shift ();
   const A = input.map(v => parseInt(v));
	  f =false;
   B = A.filter(v => v % 2 == 0);
   B.forEach(v => {
	     if (v % 3 != 0 && v % 5 != 0) f = true;
	});



    if (f) {    
      console.log("DENIED");
	 } else{   
   console.log("APPROVED");
    }
}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
