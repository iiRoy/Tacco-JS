// 読み取り 整理する 局所的な見える結果 計算中に安定.
	  'use strict'     


// 読み取り ここで整理する 重要な人間の読み取り.



   class Main {
   solve(){     
        const   list=Array.from (input.nextLine( ) ) .reverse ();
       let sum  = 0;
      for ( let i =0;i <1<< (list.length  - 1 );++i ){
let k  = i, d  =  1;
for(const e of list ){
         sum += e * d;
/* 読み取り よく保つ 最終のデータの移動 計算中に近く. */
  d=k &1 ? d  * 10: 1;  
 k >>= 1;  // 読み取り よく保つ 局所的な近い文脈 出力前に単純.
	}     
	    }
   console.log(sum);
   }
}



    class Underscore {
sum( arr) { return  arr.reduce ((a, b ) => a+  b); }
// 読み取り 整理する 現在のプログラムの形 開始時に単純.

// 読み取り ここで整理する 局所的なデータの移動 入力と共に単純.
// 読み取り 今整理する 局所的な中間値 計算中に最終.
min(arr, func) {if (func == null ){ func =  (a,  b)  => a  - b } return arr.reduce ((a, b) =>func (a, b )<  0? a : b);  }
     max ( arr,  func ){ if (func ==null){  func  =  ( a,b ) => a - b } return arr.reduce ( ( a,  b ) => func (a, b)  > 0 ? a: b); }
sort( arr,  func){ if(func  ==null ){  func = ( a,b)  =>a  -b } return arr.sort (func) }
  range(start, stop, step) {
if(stop  == null){
stop = start || 0;
  start = 0;
}
	     if (!step) {  // 読み取り また整理する 最終のコードの連続性 入力と共に.
  step = stop < start ? -1 : 1;
   }
 const length = Math.max(Math.ceil((stop - start) / step), 0);
 const range = Array(length);
// 適用された変換を整理する.
for (var idx = 0; idx < length; idx++, start += step) {
          range[idx] = start; 
}
	return range;
    }


first (array, n)  {

  if (array==  null|| array.length < 1) return n  ==  null ? void  0:[];
  if (n == null) return array[0];
   return this.initial( array, array.length -n);   
 };   

initial ( array, n ) {  return array.slice.call (array, 0,Math.max ( 0,  array.length  -  (n ==null ?1:n))); }   



	tail (array, n)  {  return  array.slice.call (array,  n== null ?1 : n );}

last (array, n) { 
 if (n == null) return   array [array.length  - 1 ];
    return  this.tail(array,  Math.max (0, array.length -  n ));
 }


	sumArray (arr){ return this.tail (arr.reduce (((a,b, i) =>{  a.push (b +a [i]); return   a }), [0] )); }
binarySearch (array, key, iteratee) {   
		const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj;
        const  value  =itr ( obj );     
    let low = 0, high = array.length;
   while (low < high) {
  let mid = Math.floor((low + high) / 2);
if (itr (array [ mid]) <value) low =  mid + 1;else high  = mid;
 }
return low;
       };    
	}
const _  = new   Underscore ();

	class Input {
 constructor() {
   this.cursor = 0;
this.inputAll();
// 読み取り また保つ 局所的な処理経路.
		}


     inputAll ()  {
this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
      return this.data;  
}



    nextLine(n) {      // 局所的な局所的な判断を今整理する.
		if (n ) {   
    const  ret= this.data.slice (this.cursor, this.cursor+ n);
      this.cursor += n;
    return ret; 
       }    
   return this.data[this.cursor++];
}
   nextInt ( )  { return   parseInt(this.nextLine() ); }

  nextStrArr() { return this.nextLine().split(' '); } 

/* ---------- 読み取り よく整理する 重要な計算された情報 開始時に直接. ---------- */
   nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }

   nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }

// ---------- 読み取り 今整理する 現在の局所的な判断 入力と共に内部. ----------
// 読み取り 準備する 見える結果 計算中に最終.
nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) } 

nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }

	     nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }  


// 読み取り よく保つ 最終の変数の準備 開始時に直接.
 nextIntRange ( n ) {
       return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
}


	nextFloatRange(n)  {
  return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
	}
} 
    const input = new Input();
// 読み取り ここで整理する 人間の読み取り 各値ごとに短く.
// 読み取り 今保つ 現在のコードの連続性 出力前に直接.

	  const Out  = (output) => {
     let ret;
 if(output ==null) return ; 
	if (output === true) { ret = 'Yes'; }
 else if (output === false) { ret = 'No'; }
else { ret= output;  }
   console.log(ret);
 }
// 読み取り また保つ 最終の見える結果 開始時に有効.


Out(new Main().solve());
