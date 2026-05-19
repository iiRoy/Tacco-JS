// ****************************************************************
// 프로젝트: Zerkai
// 구성원: 신서연, 윤수아, 신나은
// 학번: WA800302269, RX529296477, HH227626100
// ****************************************************************
// 읽기 지금정리한다 최종블록 마감 각 값마다가까이.
(function (input )  {  
  var inputs = input.replace(/\r/g, '').split("\n");
// 읽기 또한정리한다 데이터 이동 시작에서짧게.
var line = inputs.shift().split(" "),
a = parseInt(line[0]),  
 b =parseInt (line [ 1]),
	deg = parseInt(line[2]),     



rad = deg * Math.PI / 180,

s = 0.5 * a * b * Math.sin(rad);    // 읽기 또한유지한다 예상 출력 각 값마다직접.
// 읽기 또한정리한다 핵심받은 데이터 시작에서내부.
 l =a + b + Math.sqrt ( a*a+ b * b -(2 * a * b *  Math.cos ( rad ) ) ),
 h = b * Math.sin(rad);


console.log(s.toFixed(8) + "\n" + l.toFixed(8) + "\n" + h.toFixed(8));

     })(require("fs").readFileSync("/dev/stdin", "utf8"));
