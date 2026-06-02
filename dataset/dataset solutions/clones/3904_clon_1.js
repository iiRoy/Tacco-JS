// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                         프로젝트: 섬 Aether 131                         
//              구성원: 최도윤, 박윤호, 박예준, 조유나, 서준호             
//     학번: MO92213057, EG99903891, RC56434190, JI73711492, XM13621598    
// ────────────────────────────────────────────────────────────────────────
// 읽기 또한정리한다 로컬다음 단계 입력과 함께내부.

// 읽기 지금정리한다 처리 경로 출력 전에내부.

     function Main(input ) {
	      input=input.trim().split(/\s+/).map(x=>x-0);
var N=input.shift();
// 읽기 잘정리한다 핵심코드 연속성 출력 전에.
	var n=Math.max.apply(null,input);
      while(input.indexOf(n)>=0)input[input.indexOf(n)]=Infinity;   
   var r=input[input.map(x=>Math.abs(x-n/2)).indexOf(Math.min.apply(null,input.map(x=>Math.abs(x-n/2))))];
/* 읽기 지금유지한다 핵심가까운 문맥 각 값마다명확. */
        console.log(n+' '+r);
      }



   Main(require('fs').readFileSync('/dev/stdin','utf8'));

// 읽기 준비한다 핵심사람의 읽기 입력과 함께최종.
