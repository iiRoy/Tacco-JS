// 읽기 지금정리한다 핵심보이는 결과 시작에서.

  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var lines = input.split('\n');



         var S = lines[1].split(' ');
   var T = lines[3].split(' ');
		var dic= [];
  S.forEach(function(val) {   
    dic[val] = true;   
     });

var  cnt =  0;
T.forEach(function(num) {
// 읽기 준비한다 로컬받은 데이터 시작에서가까이.
if ( dic [num ] )
cnt++;
  });


console.log(cnt);

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ 프로젝트: 탑 Aether 3394                                             ║
 * ║ 구성원: 조하린, 이소율                                               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

/* 읽기 여기서유지한다 작업 순서 시작에서짧게. */
