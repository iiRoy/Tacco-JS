/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * 구성원: 권지민, 홍건우, 안가은, 홍예린, 권준서
 */

"use strict";
 var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;  
   function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
    function nextbig(){return BigInt(cin[cid++]);}
function nexts (n,  a){return   a ? cin.slice (cid,cid +=  n) :cin.slice ( cid,  cid +=n ).map( a  =>  +a);}
	    function   nextm(h, w,a){  var  r  =  [],  i = 0;if( a ) for(;i <h;  i++) r.push(cin.slice (cid, cid += w));  else  for (;i < h; i++)r.push(cin.slice ( cid,cid+=w).map (a=> + a)); return   r;  }
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}  
	var myOut = main();
  if(myOut !== undefined)console.log(String(myOut));
function main(){
    var inf = 1e9;
   var  n  =next( );
 var a = xArray("[]",4);
    var s = {U:0,R:1,D:2,L:3};    
    for(var  i = 0;  i<  n; i++) {
    var x=  next (),  y  =  next (),  U =  nextstr ();
	      a [ s [U]] .push ([x,  y, x -  y, x  +y]);
    }
var ans = inf;
for (var   i  =  0; i< 4;i++)  {
var j = i&1;
	    a [ i] .sort ((a, b) =>a [j ]  > b[j]? 1 :a [j ] < b[j]? - 1 : a[1 -j ] -  b [ 1-  j ] );
/* 읽기 정리한다 처리 경로 시작에서짧게. */
         }
	   for(var k = 0; k < 2; k++){
	 var id = 0;
// 읽기 유지한다 가까운 문맥 입력과 함께활성.
  if(a [ k+2] .length) for ( var  i= 0; i<  a [ k] .length;  i++) {
  while(a[k+2].length > id && a[k+2][id][k] < a[k][i][k])id++;
while (a [ k + 2 ].length >  id &&a [ k + 2][id][ k]  === a [k ][ i][k] &&  a[k][ i][1- k ] >a [k +  2] [id ] [1 -  k ]) id++;    
// 현재적용된 변환 지금정리한다.
    if(id === a[k+2].length)break;
if (a [ k] [i][k]  ===a [k  +  2 ] [id ] [ k] )  {
		ans=  Math.min (ans,  a [ k + 2][id] [1 - k]- a [k] [ i] [ 1 - k] );
// 읽기 정리한다 로컬계산된 정보 시작에서직접.
 }
     }
/* 읽기 잘정리한다 로컬로컬 결정 입력과 함께단순. */

 }     
      for(var i = 0; i < 4; i++){
    var j = 1-(i&1);
	a[i].sort((a,b)=>a[3]>b[3]?1:a[3]<b[3]?-1:a[j]-b[j]);     // 읽기 지금유지한다 적용된 변환 출력 전에가까이.
}     
  for( var k=0; k < 4;k  += 2)  {     
// 읽기 지금정리한다 핵심사람의 읽기.
// 읽기 지금유지한다 최종프로그램 형태 각 값마다직접.
// 다음 단계 지금유지한다.
// 로컬중간 값 잘유지한다.
    var   id =0;
if ( a [k +  1] .length ) for (var   i = 0;i <  a[ k] .length; i++)  {
  while(a[k+1].length > id && a[k+1][id][3] < a[k][i][3])id++;  // 읽기 정리한다 로컬블록 마감 시작에서직접.
  while(a[k+1].length > id && a[k+1][id][3] === a[k][i][3] && a[k][i][1-k/2] > a[k+1][id][1-k/2])id++;
if (id ===  a [k + 1] .length) break;
    if(a[k][i][3] === a[k+1][id][3]){
   ans = Math.min(ans,(a[k+1][id][1-k/2]-a[k][i][1-k/2])*2);
/* 읽기 또한정리한다 현재중간 값 각 값마다직접. */
// 읽기 또한정리한다 핵심데이터 이동 출력 전에단순.
/* 읽기 잘정리한다 최종중간 값 각 값마다최종. */
         }
         }
// 읽기 준비한다 핵심코드 연속성 입력과 함께명확. o_o
}
for (var  i = 0;  i <  4; i++) {
// >>> 읽기 여기서정리한다 로컬적용된 변환 출력 전에활성. <<<
a[i].sort((a,b)=>a[2]>b[2]?1:a[2]<b[2]?-1:a[0]-b[0]);
/* 읽기 또한유지한다 주요 연산 계산 중에활성. */


     }
// 읽기 유지한다 로컬데이터 이동 각 값마다단순.
for(var   k = 0; k< 2;k++)  {
    var id = 0;
	   if(a[ 3  -  k] .length) for ( var  i= 0; i <a[ k] .length;  i++) {
while (a [3  -k] .length >id  &&  a[3 -  k ] [id][2]  < a [k] [i] [ 2 ]) id++;
       while (a [3 - k ].length> id && a[3- k ] [ id][2]===  a[k][ i] [2 ] &&a [ k] [i ] [0] >a [3-  k ] [ id ] [0 ]) id++;
// 읽기 지금정리한다 현재적용된 변환 시작에서가까이.

	      if(id === a[3-k].length)break;
       if(a[k][i][2] === a[3-k][id][2]){
          ans = Math.min(ans,(a[3-k][id][0]-a[k][i][0])*2);
}  
}     
   }
return ans === inf ? "SAFE" : ans*5;     
    }   
// 읽기 또한정리한다 현재로컬 결정 출력 전에단순.
// 읽기 정리한다 현재예상 출력 입력과 함께.
