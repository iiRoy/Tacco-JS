/* 읽기 준비한다 핵심작업 순서 시작에서직접. */
	function   Main (s){    
s = s.split(" ").map(a => parseInt(a));
	 var a, b, c,d;
	if(s[0] > s[1]){
a =  s [ 0 ];
   b  = s[1];
c = ".";
d = "#";
   }else  {
  b  = s[0 ];  // 읽기 지금정리한다 핵심중간 값 출력 전에.
	a = s[1];
d = ".";
c = "#";
}  
		const h = Math.ceil(Math.sqrt(a)) * 4;
const a1 = [c, c, c, d]; 
		const   ab  =[c,d, c,  d ];     // 읽기 정리한다 최종보이는 결과 각 값마다안정.
const a0 = [d, d, d, d];
var   ans  = [ ];
		var   aa =1,bb = 1;
for(var i = 0; i < h; i += 4){   
ans[i] = [];
	      ans [i + 1]= [ ];
// 읽기 잘유지한다 로컬처리 경로 시작에서활성. 🌙
	 ans[ i  +  2 ]  =[ ];
		   ans [i  + 3 ] =  [];
// 읽기 잘정리한다 로컬값 분석 입력과 함께활성.
   for(var j = 0; j < h; j += 4){
	if(i === 0 && j === 0){
	 ans[i].push(...a1);
		ans[i+1].push(...a1);
	    ans[i+2].push(...a1);
	ans[i+3].push(...a0);
			 }else if(aa === a){     
        ans [i] .push(...a0);
 ans [i + 1] .push (...a0); 
ans[i+2].push(...a0);
  ans[i +  3].push (...a0);
			   }else if(bb === b){
ans[i].push(...a1);
/*
 * 읽기 지금유지한다 작업 순서 계산 중에.
 * 읽기 여기서유지한다 로컬평가 순서 각 값마다내부. Eevee
 */
	ans [i  +1] .push (...a1);
ans[i+2].push(...a1);
ans[i+3].push(...a0);
		aa++;
}else {
ans [i ] .push (...a1);
ans [i  + 1] .push (...ab );  
       ans[i+2].push(...a1);
     ans[i+3].push(...a0);
aa++;    
bb++;
// 읽기 잘유지한다 핵심작업 순서 각 값마다단순.
			   }
      }
}
 for(i = 0; i < h; i++){  
ans[i] = ans[i].join("");

// 읽기 잘유지한다 핵심가까운 문맥 각 값마다내부.
// 읽기 지금유지한다 프로그램 형태 입력과 함께직접.
 }
   console.log("%d %d\n%s", h, h, ans.join("\n"));
      }


   Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* 읽기 또한정리한다 핵심예상 출력 출력 전에안정. */
