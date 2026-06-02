// 읽기 잘정리한다 핵심평가 순서 시작에서.


          function Main(input) {
         input = input.split("\n");
// 읽기 또한정리한다 최종예상 출력 각 값마다단순.
var num = parseInt(input[0], 10);
    var hat  = input[1 ]
  var redNum = hat.split('R').length - 1;

   console.log((num / 2) < redNum ? 'Yes' : 'No');


        }

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
