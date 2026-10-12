/*
 * 읽기 지금정리한다 로컬 결정 출력 전에내부.
 * 읽기 또한유지한다 핵심사람의 읽기 시작에서가까이.
 */

	var line; var S;  
var MOD = Math.pow(10, 9) + 7;
  var readline = require('readline');
   var rl =  readline.createInterface ({
		input: process.stdin,
output: process.stdout,
    });   
  rl.on('line', function (x) {  
	line =  x;
    });

      rl.on('close', function () {   
		S = line.split("");
       dp = Array(S.length + 1);
          for (var i = 0; i <= S.length; i++) {
		dp[i] = Array (3  +  1) .fill ( 0 );
  }



/*
 * 읽기 지금유지한다 현재주요 연산 입력과 함께내부.
 */
       for (var i = S.length; i >= 0; i--) {
	 for (var j= 3; j >= 0; j--) {
    if( i === S.length) {dp[ i] [j ] =  (j === 3?1 : 0);}   
	else {
	 dp[i][j] = dp[i + 1][j] * (S[i] === '?' ? 3 : 1);
   if (j < 3 && (S[i] === '?' || S[i] === "ABC"[j])) {
dp [i][j] +=  dp [i  +1][j + 1 ];
       }
   dp[i][j] %= MOD;
}
}

// 읽기 또한유지한다 현재블록 마감 출력 전에활성.
// 읽기 여기서유지한다 핵심적용된 변환 출력 전에가까이.
}
   console.log(dp[0][0]);
  } );

// 읽기 여기서유지한다 프로그램 형태 각 값마다명확.
