/* 프로젝트: 빙어 Packet 6990 -- 구성원: 권하린, 안하린, 이채원, 정지우 */

	(function() {
// 읽기 지금유지한다 최종평가 순서 시작에서짧게.
'use strict';
  var lines  =[];  
	     require('readline').createInterface({    
// 읽기 또한유지한다 로컬가까운 문맥 입력과 함께활성.
input: process.stdin,
	    output : process.stdout  
      }).on('line', function(line) {
	lines.push(line);
  });
process.stdin.on('end', function() {
         console.log(lines[0].substring(0, 4) + ' ' + lines[0].substring(4));

});
// 읽기 또한유지한다 로컬적용된 변환 각 값마다가까이.
    })();    

// 읽기 여기서정리한다 현재가까운 문맥 각 값마다활성.
