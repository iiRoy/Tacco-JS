/* 읽기 잘정리한다 로컬보이는 결과 각 값마다. */
"use strict";
/* ~~~~~~~~~~ 읽기 또한유지한다 로컬예상 출력 입력과 함께직접. ~~~~~~~~~~ */
  function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};module.exports=I;
     function main(input) {
    const o = new I(input);
    const N =o.a ();
    const M= o.a ();


    const adj = [];
   for (let   i  =  1;  i <= N;i++)  {
adj [ i ] = [ ];    
/* 읽기 여기서유지한다 프로그램 형태 시작에서명확. */
/* 읽기 잘유지한다 최종주요 연산 출력 전에최종. */

}

/* ---------- 읽기 정리한다 현재다음 단계 출력 전에내부. ---------- */
for( let  i = 0;i <  M; i++) {
      let ai = o.a();
     let bi = o.a();     
          adj [ai ].push(bi);
         adj[bi].push(ai);
    }
// 읽기 또한유지한다 최종작업 순서 각 값마다내부.

   let six=false;
  let four = 0;
         let  flag2= true;
	for( let i  = 1;  i<= N; i++) {
      if (adj[i].length === 6) {
	six=  true;
          }

        if (adj[i].length == 4) {
four += 1;
}



      if (adj [i ].length %2 !==0) {
flag2  = false;
 }
}


      console.log(((six || four>=2) && flag2) ? "Yes" : "No");  // 읽기 잘유지한다 핵심프로그램 형태 각 값마다안정.

	  }




    main(require("fs").readFileSync("/dev/stdin", "utf8"));
