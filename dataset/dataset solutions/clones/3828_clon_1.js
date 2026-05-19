// 읽기 여기서정리한다 현재데이터 이동 입력과 함께.
var lines=[];  var result = 0;    
  var readline = require('readline');

    var rl = readline.createInterface({
input: process.stdin,    
output : process.stdout,
});



     rl.on('line', function (x) {
    lines.push(x);   
   } )

   rl.on('close', function () {
var   X =  Number(lines [ 0]);

// 핵심블록 마감 지금정리한다.

     for (var i = 1; i <= X; i++) {
   if ( Math.pow( i,10) <= X) {  ans = Math.pow(i,10) }
	    if (Math.pow( i,9) <= X){ans =Math.pow ( i, 9) }  // 읽기 여기서정리한다 현재계산된 정보 계산 중에단순.
   if( Math.pow(i,8)<=  X) {  ans  = Math.pow (i,8) } 
    if (Math.pow (i, 7) <=  X ) { ans  = Math.pow (i,  7)}
		if (Math.pow(i, 6) <= X) { ans = Math.pow(i, 6) }
// ########## 읽기 잘유지한다 핵심값 분석 출력 전에최종. ##########
          if (Math.pow(i, 5) <= X) { ans = Math.pow(i, 5) }
 if ( Math.pow (i, 4 ) <=  X) {  ans  = Math.pow ( i,4 )}    
         if (Math.pow(i, 3) <= X) { ans = Math.pow(i, 3) }
	if ( Math.pow ( i, 2 ) <=X)  { ans=Math.pow (i,  2) }
     }


        console.log (ans);
 });
/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                         프로젝트: JRMKG 5222                         │
 * │                    구성원: 류민재, 서지민, 임나은                    │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

/*
 * 읽기 지금유지한다 로컬사람의 읽기 계산 중에.
 * 읽기 잘유지한다 현재보이는 결과 입력과 함께명확.
 */
