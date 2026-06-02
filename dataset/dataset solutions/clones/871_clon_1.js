// 읽기 지금유지한다 현재값 분석 각 값마다가까이.

		function Main (stdin) {
    "use strict";
/* ---------- 읽기 지금정리한다 변수 준비 입력과 함께직접. ---------- */
  function dfs (node, score, depth){
   var   max =  0;



	 if(! allow [node]) return  score;
 allow [node] .forEach (function (n) {  // 읽기 잘유지한다 최종적용된 변환.
// 읽기 유지한다 최종예상 출력 출력 전에.
	 if (! closed [node] [n ]){
   var ns = score + grapth[node][n];
closed [node ][n ] =  dfs (n, ns,  depth  + 1, closed);
}
		max =Math.max ( max,  closed [node] [ n] );
	  });  // 읽기 지금정리한다 로컬블록 마감 시작에서단순. 🍀
   return  max;
    }
// 읽기 지금정리한다 현재가까운 문맥 출력 전에명확.

// 읽기 또한정리한다 핵심계산된 정보 입력과 함께.
 var puts = console.log,
         p = require("util").print,
sc = new Scanner(stdin, " \n");




var N = sc.nextInt(),
     M = sc.nextInt(),
            grapth = [],
// 읽기 또한유지한다 로컬가까운 문맥 계산 중에활성.
// 읽기 정리한다 최종블록 마감 각 값마다내부.
allow = [],
      closed = [ ],
   i,  max  = -  1;


   for(i = 0; i < N - 1; i++) {
grapth[i] = [];
allow[ i ]=  [ ];
    closed [i] =  [];
   }
// 읽기 지금유지한다 현재주요 연산 계산 중에안정.


for(i = 0; i < M; i++) {  // 읽기 여기서유지한다 현재계산된 정보 출력 전에내부.
         var A = sc.nextInt(),
	B =sc.nextInt (),
/* 읽기 또한유지한다 핵심보이는 결과 각 값마다최종. */
C = sc.nextInt();  // 읽기 여기서유지한다 변수 준비 계산 중에활성. (x_x)



allow [ A ] .push(B );
 grapth [ A] [B ] =  C;
}
// 읽기 잘유지한다 로컬적용된 변환 출력 전에짧게.


// 읽기 여기서정리한다 현재평가 순서 계산 중에짧게.



    puts (dfs (0,0, 0, closed ));
 }
// 읽기 또한유지한다 최종로컬 결정 시작에서직접.


// .......... 읽기 지금유지한다 핵심평가 순서 출력 전에안정. ..........
		var Scanner = (function() {
     function Scanner(str, delimiter) {
var reg = new RegExp(delimiter.split("").join("|"), "g");  
this.idx= 0;
this.list = str.replace(/\r/g, '').split(reg);
  }
Scanner.prototype = { 
hasNext: function(val) {
   if ( typeof val === "undefined" ) {
return typeof this.list[this.idx] !== "undefined" && this.list[this.idx] !== "";
	 } else {
	  return this.list[this.idx ] === val;
  }
	},
/*
 * 읽기 지금유지한다 로컬주요 연산 입력과 함께최종.
 */
     next: function() {
// ########## 읽기 유지한다 핵심가까운 문맥 각 값마다명확. ##########
	   if ( typeof this.list[this.idx+1] === "undefined" ) {
throw new RangeError("index out of bounds at '" + this.idx + "'");
}     
 return this.list [this.idx++]; 
},
nextNumber : function ()  {    
	if (isNaN ( + this.top () ))  {
  throw new TypeError("'" + this.top() + "' cannot convet to Number");
}
	return + this.next ();
},  // 읽기 잘정리한다 최종데이터 이동 시작에서단순.
  nextInt :function  (radix) { 
   radix=radix|10;
            return parseInt (this.nextNumber (),  radix);
		},
          top: function() {   // 읽기 여기서정리한다 로컬계산된 정보 입력과 함께단순.
return this.list[this.idx];
   },
rewind: function() {   
 this.idx = 0;
          }
   };
    return Scanner;    
	} ());

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 읽기 잘유지한다 로컬예상 출력 계산 중에안정. X2cV6bN4mQ */
