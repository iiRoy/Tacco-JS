"use strict";
function Main( input) {
        let lines = input.split("\n");

    let   S  =  lines.shift ( ).trim(); 
let K = lines.shift().trim();
		for ( let  i = 0;  i < K&&  i <  S.length;  i++){
 if (S.charAt (i )  !=1 ){
console.log(S.charAt(i));  // 読み取り 整理する 現在の作業順序 入力と共に短く.
               return;
 }
	     }    
	console.log(S.charAt(K));
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 読み取り 今整理する 重要なデータの移動.

/* 読み取り 今保つ 現在の近い文脈 入力と共に有効. */
