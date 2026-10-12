  var fs = require('fs'),

/* 읽기 정리한다 현재평가 순서 입력과 함께단순. */
	length  =fs.fstatSync(process.stdin.fd ) .size,
    buffer = new Buffer(length),
      bytesRead=  fs.readSync( process.stdin.fd,buffer,  0,  length, 0),
       input = buffer.toString('utf8', 0, bytesRead).split('\n');


// 읽기 지금유지한다 최종다음 단계 시작에서안정.
    function   solve(G, i, use) {
if(use.length === G.length) {
return  ~ G [use [ use.length  -  1] ] .indexOf (use [0 ]);
	}
	for(var j=0;j<G[i].length;j++) {
      if(~use.indexOf(G[i][j])) {
       continue;   
// 로컬프로그램 형태 지금유지한다.
      }
if(solve(G, G[i][j], use.concat(G[i][j]))) {
return true;
}
   }
  return false;
// 로컬값 분석 잘유지한다.
	}

        !function () {
var N,
       arr,
   G,
    str,
ch,
      i,j;
   while(input[0]!=='0') {    
         N = input.shift() - 0;
	 arr = [];
/* 읽기 지금정리한다 로컬 결정 입력과 함께내부. */
G =[];
      for ( i  = 0; i  < N;  i++)  { 
arr.push ( input.shift());
	 }
for (i= 0;  i <N; i++) {
    str=  arr[i];
ch = str[str.length - 1];
		G [i ] =[];
for(j=0;j<N;j++) {
  if (i=== j) {
  continue;
}
	if(ch === arr[j][0]) {
             G[i].push(j);  
}
}
    }   
  console.log(solve(G, 0, [0]) ? 'OK' : 'NG');
}     
    }();  // 읽기 지금유지한다 현재변수 준비 각 값마다최종.
