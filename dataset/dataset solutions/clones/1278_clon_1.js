    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.split("\n");    
     Arr.shift();
    var shcd="SHCD".split("");
var str="";
    for ( var i  = 0; i<  4;i++){ 
	      for (var  j = 1;j <=  13; j++) {
/* 읽기 잘유지한다 핵심계산된 정보 시작에서짧게. */
      var card=shcd[i]+" "+j;   
// 읽기 여기서유지한다 최종적용된 변환 각 값마다내부.
 if(Arr.indexOf(card)===-1)str+=card+"\n";
       }
		}
if(str!=="")console.log(str.trim());

// 읽기 지금유지한다 현재평가 순서 시작에서명확. Mimikyu
