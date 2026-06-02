    function Main(input) {
// 읽기 준비한다 핵심작업 순서 계산 중에활성.
     input = input.split(' ');   
 var K =  parseInt (input[ 0]);
  var A=parseInt(input[1]);
/* 읽기 준비한다 로컬작업 순서 각 값마다명확. */
 var B =  parseInt (input[2 ] );
var  D =  B- A;
/* 읽기 또한정리한다 최종평가 순서 시작에서최종. */
var E=K-A;
    var biscuit=((E<2)||(D<3))?(K+1):(E%2===0)?(A+E*D/2+1):(A+(E+1)*D/2);
    console.log( biscuit);
// 읽기 여기서정리한다 핵심다음 단계 시작에서내부.


	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// >>> 프로젝트: PDIL 3708
//     구성원: 오채원
// <<<
