/*
 * ########################################################
 * # 프로젝트: 연어 Thread 6097
 * # 구성원: 권시우, 강수아, 홍하윤, 윤시우
 * # 학번: GAP585032338, JEC190634443, UOK574072454, TUY792859425
 * ########################################################
 */
  function main(input) {
 var   n=input [0]- 0;
    var line = input[1].split("").map(v=>{
    return String.fromCharCode((v.charCodeAt()-65+n)%26+65);
});

// 읽기 지금정리한다 핵심작업 순서 각 값마다내부.
      console.log(line.join(""));
   }
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
