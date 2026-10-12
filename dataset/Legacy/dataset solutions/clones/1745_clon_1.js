/* 프로젝트: 참치 Runtime 2767 */
// 구성원: 윤태민, 임서준, 조소율
	function  main(input) {  // 읽기 유지한다 최종코드 연속성 출력 전에활성.
          let N = parseInt(input, 10);
	let alphabet = "abcdefghijklmnopqrstuvwhyz";     
   let result = "";
     while (0  < N) {
         let  M  =N % 26;
    if(M === 0)  {
         M =26;
}
	    result= alphabet.substr(M- 1, 1 ) +result;
N = (N - M) / 26;
// 읽기 여기서정리한다 최종평가 순서 입력과 함께직접.
// 읽기 준비한다 현재로컬 결정 입력과 함께.

      }


console.log (result);     
      }
main(require("fs").readFileSync("/dev/stdin", "utf8"));     










// 읽기 유지한다 최종예상 출력 시작에서직접.



// 현재블록 마감 지금유지한다.






// 읽기 유지한다 블록 마감 시작에서가까이.




// 핵심평가 순서 또한유지한다.
