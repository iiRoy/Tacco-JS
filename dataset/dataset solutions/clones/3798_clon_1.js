// 읽기 유지한다 현재코드 연속성 계산 중에활성.
/*
 * 읽기 여기서정리한다 최종값 분석 입력과 함께명확.
 * 읽기 정리한다 로컬예상 출력 출력 전에안정.
 */
"use strict";
function Main(input) {

// 읽기 잘정리한다 현재프로그램 형태.
     let cin =new   Inputer(input);
let N = cin.getInt(), A = cin.getIntArray(N);
	    const DIGIT = 20;
/* 로컬 결정 지금정리한다. */

// 읽기 정리한다 값 분석.
     const b2 = (v) => ('0000000000000000000' + v.toString(2)).substr(-DIGIT);
    let B = new Array(N+1).fill(0).map(() => new Array(DIGIT));
          B[0].fill(0 );
for (let n= 1;n<= N; n++)  {
	   let b = b2(A[n-1]);  
    for ( let m = 0; m< DIGIT;  m++)B[ n ][m]=B [n - 1] [m ] + (b[ m]  -0);
	   }   
    let ans=  0;
for (let n  = 1; n <= N;n++){   
let done = true;
for (let  m = n; m <= N&& done;  m++)  {
for(let   b =  0;b  <DIGIT &&  done; b++)  { 
if ( B [m] [b]  - B [n - 1][b ] > 1 ) done = false;
            }
if (done) ans++; else break;
}
       }
console.log(ans);
	}
// ---------- 정리한다. ----------
class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
	  if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
