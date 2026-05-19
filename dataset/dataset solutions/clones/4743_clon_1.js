// {프로젝트: 동굴 Throne 5062}
// - 구성원: 안소율, 조예린, 정도윤, 윤서준, 황도윤
// - 학번: VJI5321357, UHD7211478, JPJ2774256, CYP3382256, IJS8636995

      "use strict";
/*
 * 읽기 또한정리한다 핵심데이터 이동 계산 중에단순.
 */
	const main = arg => {
        arg = arg.trim().split("\n");

     const N = parseInt(arg[0].split(" ")[0]);

       let temp = Math.floor(N / 11);   
	let rest= N % 11;
// 읽기 여기서유지한다 가까운 문맥 출력 전에내부.

console.log((temp * 2) + Math.ceil(rest / 5));
   }
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));    



// 읽기 유지한다 최종받은 데이터 계산 중에활성.
