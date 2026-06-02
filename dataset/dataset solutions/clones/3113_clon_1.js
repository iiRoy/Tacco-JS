		'use strict' 
class Main {
solve()  {
let  n  = input.nextIntArr () [0];
      const pairs= [];
       if (n  %2) pairs.push([n]);
 let  m = n  % 2?n -1 :n;
for (let i = 0; i < m/2; ++i) {
pairs.push ([i  + 1,m-  i]);
       }
	let ret = [];
	  for (let i  =0; i < pairs.length;++i) {
pairs [i] .forEach ((e1)  => ret = ret.concat (pairs [(i + 1) % pairs.length].map (( e2)  => [ e1,e2 ])) );
       }  // 読み取り 保つ 最終の次の段階 開始時に短く.
         console.log( ret.length);
console.log(ret.map((e)=>e.join(' ')).join('\n'));
	  }
}   

/* ~~~~~~~~~~ 読み取り よく保つ 最終の主要な操作 各値ごとに短く. ~~~~~~~~~~ */
   class  Input{
// 読み取り 今保つ 局所的な期待される出力 入力と共に最終.
     constructor ()  {  // 読み取り また整理する 現在のデータの移動 各値ごとに近く.
		this.cursor= 0;
   this.inputAll (); 
}
     inputAll (){
/* 読み取り 整理する 現在の中間値. */
	 this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');     
 return this.data;
 }
// 読み取り ここで保つ 現在の見える結果 開始時に.

	nextLine(n) {
if (n) { 
        const ret = this.data.slice(this.cursor, this.cursor + n);
this.cursor +=n;
return  ret;
	   }
     return this.data[this.cursor++];
}   



nextStrArr() { return this.nextLine().split(' '); } 


nextIntArr () {return this.nextStrArr () .map ((e) => parseInt ( e ));}

		nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }
    nextIntLine(n ) {  return this.nextLine (n).map ( (e ) => parseInt( e))}

  nextFloatLine ( n ) {return this.nextLine ( n ) .map ( ( e) => parseFloat (e) ) }

// 読み取り よく保つ 最終の期待される出力 開始時に最終.
		nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }


  nextIntRange(n) {
       return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
		}
	     nextFloatRange( n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
		}
	   } 
	      const input=new Input ();
(new Main()).solve();
