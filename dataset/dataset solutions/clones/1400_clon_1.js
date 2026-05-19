      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
 while (true ){
var   x = arr.shift ( );
// 읽기 또한정리한다 적용된 변환 입력과 함께최종.
      var ary=x.split(" ");
  var   a = ary [0 ]  - 0;
var b  = ary[1 ] -0;
 if(ary[1]=="%")break;
if(ary[1]=="+")console.log(a+b);
if(ary[1]=="-")console.log(a-b);
if(ary[1]=="*")console.log(a*b);
if(ary[1]=="/")console.log(~~(a/b));
/*
 * 읽기 또한정리한다 최종가까운 문맥 시작에서단순.
 * 읽기 지금유지한다 핵심주요 연산 입력과 함께.
 */
        }

// 읽기 또한유지한다 핵심값 분석 각 값마다명확.
