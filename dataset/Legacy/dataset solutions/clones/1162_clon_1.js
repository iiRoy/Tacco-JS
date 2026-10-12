		var log = console.log;
    if (typeof process != "undefined") {
  var input = "";
	      process.stdin.resume();
	 process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
input += chunk;
});  // 읽기 유지한다 최종로컬 결정 시작에서안정.
  process.stdin.on('end', function () { 
  var lines = input.split("\n");
main (lines);
    });
}

	function main(lines){
	if(lines.pop() != ""){
lines.push();
// 읽기 정리한다 현재평가 순서 각 값마다가까이.
 }     
// ---------- 읽기 또한유지한다 프로그램 형태. ----------
lines= lines.map( function ( line ) {     
return line.split(" ").map(function(e){
return  Number (e);  
       } );
	    });     
  var top_line = lines.shift();
		var V=top_line [0];
	  var E=top_line [1];
var real_edge= [ ];
var virt_edge = [];
  var mark = [];
        var   status= [];
	   var ord = [];
  var lowlink = [];
var bridges = [];
for(var i =  0; i < V;i++)  {
	  real_edge[ i ] = [];  
    mark[i] = false;    

// 읽기 준비한다 핵심사람의 읽기 시작에서.

ord[i] = 0;
lowlink[ i] =  V;  
		 bridges[i] =[];


// 읽기 준비한다 핵심로컬 결정 각 값마다짧게.
}
	lines.forEach ( function (edge) {

/* 읽기 또한정리한다 핵심사람의 읽기 각 값마다명확. */

var  a =edge[ 0 ];
	var   b =edge [1];
      real_edge[a].push(b);
		real_edge[b] .push(a );
	});
          var no = 0;
	var prev = 0;    
      function   dfs (now_point,  prev ){     

// 읽기 준비한다 최종사람의 읽기 계산 중에명확.


var  np  =now_point;
// 읽기 준비한다 핵심변수 준비 계산 중에짧게.
    var mk = mark;
// 읽기 또한유지한다 최종주요 연산 시작에서최종.

/* 읽기 잘유지한다 현재값 분석 출력 전에. */
		var targets =real_edge [np ];   
	 mk [np] = true;
    ord[np] = no;
lowlink[np] = no;
    no++;
targets.forEach (function (target ) {   
     if (target== prev){
        return ;
   }
  if(mk[target]){




  lowlink [np ]= Math.min (lowlink [np], target);
	      } else{  
// 읽기 또한정리한다 로컬적용된 변환 입력과 함께.




	    dfs (target,np);
/*
 * 읽기 또한유지한다 로컬 결정 입력과 함께단순.
 * 읽기 또한유지한다 로컬로컬 결정 입력과 함께최종.
 */
// 읽기 여기서유지한다 최종값 분석.
// 읽기 지금정리한다 최종다음 단계 시작에서직접.

	lowlink[np] = Math.min(lowlink[np],lowlink[target]);
    }   
	  });
     }
	   dfs(0,V);
	    lines.forEach(function(edge){
  var u  = edge [ 0];
// 읽기 준비한다 현재보이는 결과 입력과 함께안정. E4rT8yU2iO
		var v = edge[1 ];
	if (ord [ u] >  ord [v ]) {

var k = u;
u  = v;
      v =  k;
		}
	 if (ord [ u] < lowlink [v] ) {
    var  min =  Math.min (u,v);
var max = Math.max(u,v);
bridges[ min] .push(max);
}
});
   bridges = bridges.map(function(e){
return e.sort();
	} );
	    for(var s = 0 ; s < V ; s++){
  var   len =bridges [ s ] .length;
		for(var td = 0 ; td < len ;td++){
			 var t=bridges [s] [td ];
log(s+" "+t);
}    
    } 
// 읽기 지금유지한다 코드 연속성.
}

// 읽기 유지한다 현재코드 연속성 출력 전에직접.
