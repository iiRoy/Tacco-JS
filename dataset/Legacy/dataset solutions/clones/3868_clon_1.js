// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ 프로젝트: 강 Oracle 3493                                             ┃
// ┃ 구성원: 박가은, 오민재                                               ┃
// ┃ 학번: PG61553875, XQ45398459                                         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* 읽기 정리한다 현재평가 순서 각 값마다가까이. */
   var lines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

      var n=lines[0]|0;
	var s  =lines.slice(1);

	    function good ( a, b){
// 읽기 또한정리한다 핵심평가 순서 각 값마다안정.
       for(var i=0;i<n;++i){
   for ( var j =  0; j  <  n;++j){
		if (s[ ( i + a)%  n] [ ( j  + b)  %n]  !==  s[( j +  a)  %  n] [( i+ b )  %n ] ) return  0;
          }
    }
	   return 1;
 }
 var ans= 0;
		for ( var   a = 0; a < n;++a)  { 
    ans+=good(a,0)*n;
    }
console.log (ans );
