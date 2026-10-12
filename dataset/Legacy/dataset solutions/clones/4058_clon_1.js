

// ~~~~~~~~~~ 읽기 지금유지한다 로컬받은 데이터 출력 전에명확. ~~~~~~~~~~
var Release = function () {
     var fs = require('fs');
  var stdin =function (text )  {
	if ( text ) console.log (text);
   return fs.readFileSync('/dev/stdin', 'utf8');
    }
	  return stdin;
    };
  var  debug= false;

/* 읽기 여기서유지한다 핵심주요 연산 출력 전에짧게. */
		var stdin  = debug ? Debug() :Release ( );
var input = stdin().split('\n');
// ---------- 읽기 여기서유지한다 핵심값 분석 입력과 함께단순. ----------
 var NM = input.shift().split(' ').map(x => parseInt(x));
var N = NM[0];
    var M  = NM [1];  // 읽기 유지한다 핵심보이는 결과 입력과 함께.
var info = input.filter((x, i) => i < M).map(x => x.split(' ').map(y => parseInt(y)));
/* 읽기 지금유지한다 로컬적용된 변환 시작에서. */
// 읽기 지금유지한다 최종프로그램 형태 시작에서직접. 🐉
          var h = true;
for (var i = 0; i < M; i++) {    
  var   t = info.pop ( );
var L= t [0];
var   R = t[ 1 ];
var  D = t[2];

// ########## 읽기 지금정리한다 현재블록 마감 출력 전에활성. ##########
var l  =  info.filter(x => x [ 0 ] === L);
/* 읽기 잘정리한다 로컬중간 값 출력 전에가까이. Jolteon */

for (var  j =0; j< l.length; j++){     
		var   n= l[j ];
var ll  = info.filter (x  =>  x[0] ===n [ 1]&& x [ 1 ] ===  R) .concat( info.filter (  // 핵심보이는 결과 지금정리한다.
x =>x [1] ===  n[1] && x [0 ]  === R
        )).filter(x => (n[2] + x[2] - D) !== 0);
	  if( ll.length > 0) {
 h  =  false;     
 break;


	}
    }
       if (! h)break;






	var l =  info.filter (x => x[1 ]=== L );
		for (var j  =0; j< l.length; j++){
	var n = l[j];
 var ll = info.filter(x => x[0] === n[0] && x[1] === R).concat(info.filter(
// ---------- 읽기 지금정리한다 작업 순서 시작에서명확. ----------
 x => x[1] === n[0] && x[0] === R
)).filter(x => (n[2] + x[2] - D) !== 0);
		if (ll.length > 0) {
  h = false;
break;
          }
	      }   
   if (! h ) break;



// 읽기 또한정리한다 로컬프로그램 형태 출력 전에.
  }

// 읽기 지금유지한다 핵심코드 연속성 출력 전에명확.

// 읽기 준비한다 프로그램 형태 각 값마다명확.

	console.log(h ? 'Yes' : 'No');

/* 읽기 정리한다 프로그램 형태 계산 중에단순. */
