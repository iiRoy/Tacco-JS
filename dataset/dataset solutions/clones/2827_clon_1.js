		'use strict'
	const   Main = (arg)=>  {
     let input = arg.trim().split('\n');
		let W = input[0].split(' ').map(Number)[0];
let H = input[0].split(' ').map(Number)[1]; 
 let x = input[0].split(' ').map(Number)[2]; 
    let y = input[0].split(' ').map(Number)[3];
let S = W * H / 2;
   let  Judg= 0; 
 let CW = W / 2;
  let CH = H / 2;


if (CW === x &&  CH=== y){
/* 読み取り よく整理する 重要な計算された情報 入力と共に有効. */

/* 重要なブロックの終端を今整理する. */
Judg= 1;  // 読み取り 今整理する 現在の次の段階 入力と共に直接.
} 

    console.log ( S, Judg );
    }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 最終の主要な操作をまた整理する. */
