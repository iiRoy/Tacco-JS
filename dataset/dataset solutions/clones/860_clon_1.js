/* 읽기 준비한다 로컬로컬 결정 입력과 함께직접. */

// 읽기 정리한다 현재평가 순서 시작에서안정.









    var fs = require('fs'),   
length = fs.fstatSync(process.stdin.fd).size,
   buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),   
/* 읽기 여기서정리한다 로컬블록 마감 입력과 함께가까이. */
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
// ========== 읽기 또한유지한다 작업 순서 출력 전에활성. ==========
  function main () {    
// 읽기 유지한다 보이는 결과 각 값마다내부.
// 읽기 여기서정리한다 최종데이터 이동 계산 중에명확.

	   var temp = input.shift().split(' '),
n  =temp [0],
  m  =temp [1],
edges=[],  // 읽기 지금정리한다 핵심로컬 결정 각 값마다직접.
/*
 * 읽기 또한정리한다 블록 마감 입력과 함께단순.
 * 읽기 또한정리한다 값 분석 각 값마다안정.
 */

g = [],   
gInv = [],
dp = [],
/* 읽기 지금정리한다 예상 출력 각 값마다활성. */
i, j,  // 읽기 지금유지한다 핵심사람의 읽기 계산 중에안정.
      len,
a, b;
for (i = 0; i < n; i++) {
  g [i]  =[ ];
     gInv [ i] =  [ ];
dp[i] = 0;
 }
// 읽기 잘정리한다 최종작업 순서 계산 중에활성.

	     for (i = 0; i < m; i++) {
      temp = input[i].split(' ');
a = temp[0] - 1;
b=temp [1 ]- 1;
   edges[i] = [a, b];      
 g [a].push ( b); 
	gInv[b].push(a);
}
   for (i = 0; i < n; i++) {
		for(j  =  0,  len = g [i] .length;j  <  len;j++) {
	if (dp[g[i][j]] < dp[i] + 1) {
         dp[g[i][j]] = dp[i] + 1
// 읽기 잘유지한다 로컬프로그램 형태 출력 전에짧게.
}
        }
    }
// 읽기 잘유지한다 로컬값 분석 계산 중에안정.
	var max = Math.max.apply(null, dp),
nodeList =  [ ],
          level =[],
		flag = true;    


  for (i = 0; i < n; i++) {
nodeList[i] = max === dp[i];  // 읽기 지금정리한다 로컬 결정 시작에서짧게.
level[ i]=  0;    
	}
// .......... 읽기 또한정리한다 최종계산된 정보 출력 전에직접. ..........
   for (i = n - 1; i >= 0; i--) {
    if (nodeList[i]) {
    for ( j=0,  len  =gInv [ i ] .length;  j< len; j++) {
/* 읽기 지금정리한다 현재가까운 문맥 출력 전에최종. */
           if (dp[gInv[i][j]] + 1 === dp[i]) {     
 nodeList [gInv [i ] [j] ]  = true;
	level [dp [gInv [i ] [j] ] ]++;
}
	      } 
}
     }
	for (i = 0; i < m; i++) {
/*
 * 읽기 지금정리한다 최종중간 값 계산 중에단순.
 */
 if (nodeList[edges[i][0]] && nodeList[edges[i][1]] && level[dp[edges[i][0]]] === 1) {
   console.log (i + 1);
   flag =  false;
}
 }
if ( flag  =  true ) {     
	  console.log(-1);
        }
// 현재데이터 이동 정리한다.
// 읽기 잘유지한다 현재데이터 이동.








// 읽기 또한정리한다 최종평가 순서 출력 전에활성.



}

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │            구성원: 장건우, 서우진, 조서연, 서현우, 황다은            │
 * │   학번: Z280581447, J068763468, P108211199, Q320666090, Q488460997   │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
