/*
 * +----------------------------------------------------------------------+
 * | 프로젝트: 대구 Signal                                                |
 * | 구성원: 정유나, 신수아                                               |
 * | 학번: JA933113509, XC176171871                                       |
 * +----------------------------------------------------------------------+
 */
/* 읽기 또한정리한다 최종데이터 이동 시작에서직접. */

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
// 읽기 정리한다 핵심값 분석 출력 전에최종.
var vals = input.split(' ').map(function(n){return +n;});

	var   x1= vals [0]; 
var y1 = vals[1];     
var x2 = vals[2];

// 읽기 준비한다 로컬값 분석 입력과 함께명확.
	var y2 = vals[3]; 

var   d2 =Math.pow (x1- x2,2)  +  Math.pow (y1-y2, 2);
console.log ( Math.sqrt (d2) .toFixed (5) );
