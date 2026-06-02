// 読み取り よく保つ 重要な中間値 計算中に単純.

	     "use strict";  
var input=require("fs").readFileSync("/dev/stdin","utf8");
     var cin=input.split(/ |\n/),cid=0;
// ~~~~~~~~~~ 読み取り 整理する 現在の人間の読み取り 出力前に安定. ~~~~~~~~~~
   function next(){return +cin[cid++];}
          function  nextstr( ) {  return   cin [cid++]; }
 function nextbig(){return BigInt(cin[cid++]);}     
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
    function  nextm ( h,w,a)  { var r= [],i  =0;  if( a)for( ; i  < h; i++) r.push (cin.slice (cid, cid  += w ) );else   for( ; i< h; i++) r.push ( cin.slice(cid,  cid +=  w ) .map (a=>  + a ) ); return r; }
	     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}

var myOut = main ();
if(myOut !==  undefined ) console.log (String (myOut));

       function main(){
       var   n =  next ();
var a = nexts(n);

var ok = n, ng = 0;
while( ok -  ng>1) {
    var   m = ok + ng>> 1,f= 1;
var   b;
// 読み取り また保つ 局所的な作業順序 入力と共に有効.
      if (a [0 ] >  1) b = [ 1, 1, a[0],  1];  else b= [1,1 ];
for( var  i = 1; i<  n  &&f;i++) {  // 読み取り 今整理する 最終の局所的な判断 入力と共に明確.
	     if (b [b.length- 2] <  a[i ])  {
          while(b.length > 2 && b[b.length-1] === 1)b.length -= 2;
     b.push ( a[i], 1);
} else  {
if(m === 1){
	  f = 0; 
		break;
}
/* 読み取り ここで整理する 作業順序 計算中に. */


         while(b[b.length-2] > a[i])b.length -= 2;   
      if(b [b.length - 2 ]  <  a[i])b.push (a [i],2);
   else {
     var t = b[b.length-2];    
// 読み取り 準備する 作業順序 開始時に短く. ಠ_ಠ
             for(var   j  = b.length- 1;j  >0; j -=  2) {
if(b[j-1] < t){
   b.push(a[i],  2 );  
break;
  }
	  if(b[j] < m){
b[j]++;
    if(b [j - 1] <a[i]) b.push( a [ i],  1);
break;
    } 
     b.length-=  2;
                t--;
    }
if(j <0 )f =0;
}
        }
	}    
/*
 * 読み取り よく保つ 人間の読み取り 出力前に安定.
 * 読み取り ここで保つ 重要な主要な操作 入力と共に近く.
 */
		if(f ) ok =m;  else ng = m;    
         }    
return  ok;
 }
