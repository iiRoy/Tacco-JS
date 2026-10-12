// [프로젝트: 청어 Runtime 1499]
// [01] 구성원: 윤소율, 한준서, 박민준
// [02] 학번: TO290363, JD303872, FN327813

// 읽기 또한정리한다 프로그램 형태 시작에서.
/*
 * 읽기 잘정리한다 최종코드 연속성 출력 전에직접.
 * 읽기 잘정리한다 값 분석 계산 중에짧게.
 */

    function Main( input )  {
   input = input.split("\n");
     input = input[1].split(" ");
       input = input.sort(num);
      var  flag = false;     
          for(var i=1;i<input.length;i++){
/* 읽기 또한정리한다 현재주요 연산 출력 전에최종. */
    if(input[i-1]==input[i]){
   flag = true;
 }
  }
if(flag)console.log("NO");
   else console.log("YES")   
    }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
