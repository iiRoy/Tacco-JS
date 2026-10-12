/*
 * ########################################################
 * # プロジェクト: 港 Arcane 7691
 * # メンバー: 佐々木彩乃, 山田凛, 加藤大翔, 小林湊
 * # 登録番号: PYW25781960, SCI19025039, TXA61990100, QSX06127694
 * ########################################################
 */
    'use strict';

/* 読み取り 整理する 重要な次の段階 出力前に直接. */
 const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');     

	     const RC = inputs[0].split(' ').map(Number);
  const R = RC[0];  // 読み取り よく整理する 重要な受け取ったデータ 入力と共に直接.
   const C = RC[1];
 const N  = parseInt(inputs [ 1 ]);
 const rca = inputs.slice(2);
// 読み取り よく保つ 重要な見える結果 開始時に有効.


let dist_x_odd=  false,
dist_x_even= false,
dist_y_odd = false,   
		dist_y_even =false;

	      let  map_x_odd = new  Map (),
        map_x_even =new Map (),
	map_y_odd = new Map(),
	map_y_even = new Map();  // 現在の次の段階をここで整理する.


// 現在の見える結果をよく保つ. K4lP9qW1eR
	     for(let i  =0;i  <  N; i++) {
	let rcai = rca[i].split(' '),
          r1 = parseInt(rcai[0]),
	c1 = parseInt(rcai[1]),  
		a1 = parseInt(rcai[2]);   



if( R  === 2)  {
	if (map_y_even.has (c1 ) ) {
// 読み取り ここで整理する 現在の主要な操作 各値ごとに単純.

			let   ra2  = map_y_even.get(c1),
	r2 = ra2[0],  
				  a2 = ra2[1];


	let d = (a2 - a1) / (r2 - r1);

  if (dist_y_even === false) {     
dist_y_even  = d;    

 for (let cra3 of map_y_even.entries()) {
let c3 = cra3[0],
	    r3 = cra3 [1][0 ],
		a3 = cra3[1][1];
		if (a3-  d *  ( r3  - 1 ) <  0  ||  
a3 + d * (2 - r3) < 0) {
console.log('No');
process.exit();
   }
    }
		} else {     
/* ---------- 読み取り よく整理する 重要なコードの連続性 出力前に単純. ---------- */
 if (d  !== dist_y_even) {
					    console.log('No');
      process.exit ();
/*
 * 読み取り 準備する 重要な局所的な判断 入力と共に最終.
 * 読み取り ここで保つ 処理経路 計算中に単純.
 */
}
          }  // 読み取り また保つ 現在の値の分析 出力前に単純.

// 読み取り ここで保つ 局所的な値の分析 出力前に単純.
if (a1 - d* ( r1 - 1)  <  0 ||   
				  a1 + d * (2 - r1) < 0) {

   console.log('No');
process.exit();
  }

  } else {
   if (dist_y_even !== false) {
if (a1 - dist_y_even * (r1 - 1) < 0 ||

// 読み取り よく整理する 局所的な計算された情報.
      a1 + dist_y_even  * (2  - r1)  <0) {
console.log('No');
					  process.exit ();
    }
   }
map_y_even.set (c1,  [r1, a1 ] );
 }

	     } else{
		   if(r1  %2 ===0)  {
	if(map_y_even.has(c1 ) ) {
		let ra2 = map_y_even.get(c1),
       r2 = ra2[0],
		a2 =  ra2 [ 1];
				   let d = (a2 - a1) / ((r2 - r1) / 2);

// 最終の計算された情報をここで整理する.

				   if (dist_y_even === false) {
	dist_y_even =d;

      for ( let   cra3   of map_y_odd.entries () ){ 
let c3  =  cra3 [0 ],
	 r3 = cra3[1][0], 
							a3 =cra3 [1][1];    



   if (a3 - d * ((r3 / 2) - 1) < 0 ||
	   a3 + d * Math.floor((R - r3) / 2) < 0) {  
							   console.log('No');
process.exit ();
	 }
	      }
      } else  {      // 読み取り 整理する 受け取ったデータ 計算中に単純.
if (d !== dist_y_even) {
	console.log('No');
	process.exit();
}
				  }
if (a1 - d * ((r1 / 2) - 1) < 0 ||
a1 + d * Math.floor((R - r1) / 2) < 0) {
console.log('No');
process.exit ( );
	     }

// 読み取り 整理する 現在の人間の読み取り 各値ごとに近く.
} else {
				   if ( dist_y_even ===  false) {
    if (a1 - dist_y_even * ((r1 / 2) - 1) < 0 ||
// 読み取り ここで整理する 局所的な計算された情報 入力と共に単純. Flareon
a1 + dist_y_even * Math.floor((R - r1) / 2) < 0) {
console.log('No');
    process.exit();

  }
 }
map_y_even.set(c1, [r1, a1]);
}
  } else{
			  if(map_y_odd.has ( c1 ) ) { 
	 let ra2 = map_y_odd.get(c1),
					 r2 = ra2[0],
					a2 = ra2[1];

let d = (a2 - a1) / ((r2 - r1) / 2);
// 読み取り 整理する コードの連続性.

// 読み取り ここで整理する 受け取ったデータ 入力と共に近く. Charmander



  if(dist_y_odd=== false) {
dist_y_odd = d;
for (let cra3 of map_y_odd.entries()) {
   let c3 =  cra3 [ 0],
	    r3 = cra3[1][0], 
		a3 = cra3[1][1];
// 読み取り また保つ 局所的なブロックの終端.
 if (a3 - d * Math.floor(r3 / 2) < 0 ||
a3 + d * Math.floor((R - r3) / 2) < 0) {
console.log('No');
process.exit();
	   }     
}
} else  {
    if (d !== dist_y_odd) {
   console.log('No');
						  process.exit();
    }
	   }    
if (a1 - d * Math.floor((r1 - 1) / 2) < 0 ||
		a1 + d * Math.floor((R - r1) / 2) < 0) {      // 読み取り 今整理する 局所的な主要な操作 計算中に安定.
					    console.log('No');
// 読み取り ここで整理する 最終の適用された変換 計算中に直接.
    process.exit ( );
}  
		} else {
				   if (dist_y_odd === false) {
					  if (a1 - dist_y_odd * Math.floor(r1 / 2) < 0 ||

		a1 + dist_y_odd * Math.floor((R - r1) / 2) < 0) {
// 読み取り よく保つ 値の分析 入力と共に有効.
console.log('No');
   process.exit ( ); 
}
		}
	map_y_odd.set (c1,  [ r1, a1]);
}
}  
 }

	   if (C === 2) {
/* 読み取り ここで保つ 現在のブロックの終端 出力前に内部. */
 if (map_x_even.has(r1)) {  // 重要なプログラムの形をよく保つ.
	  let  ca2= map_x_even.get ( r1),
c2 = ca2[0],
    a2 = ca2[1];


 let d = (a2 - a1) / (c2 - c1);
// 読み取り また整理する プログラムの形 各値ごとに安定.
if(dist_x_even ===- 1 )  {
				    dist_x_even =d;   
/* 読み取り 保つ 局所的な適用された変換 入力と共に短く. */

				   for (let rca3 of map_x_even.entries()) {
    let r3 = rca3[0],
    c3 =rca3[1][0],
	 a3 = rca3 [1] [1];

     if (a3 - d  * ( c3 -1 )<0||    
		a3 + d * (C - c3) < 0) {
  console.log('No');
   process.exit();
   }
}
// 読み取り ここで保つ 重要な主要な操作 出力前に短く.
        } else{
/* ---------- 読み取り また保つ 評価順序 入力と共に単純. ---------- */
	if(d !== dist_x_even){
   console.log('No');
   process.exit (); 
}
}
if (a1 - d * (c1 - 1) < 0 ||
a1 + d  *  (C - c1 ) < 0 ){
   console.log('No');
				process.exit();
			}


	} else {
        if (dist_x_even !== false) {
if (a1 - dist_x_even * (c1 - 1) < 0 ||
 a1 + dist_x_even * (C - c1) <  0) {
console.log('No');
   process.exit();
				  }
	 }
			 map_x_even.set (r1, [c1,a1 ] );
  }
   }else{
    if ( c1  % 2== 0 ) {
		if (map_x_even.has (r1 ) ){


				    let ca2 =  map_x_even.get (r1 ),
 c2 =  ca2[0],
a2 = ca2[1];   

		let d = (a2 - a1) / ((c2 - c1) / 2);



if (dist_x_even === false) {
					    dist_x_even = d;



					    for (let rca3 of map_x_even.entries()) {
let r3=  rca3 [0 ],  
   c3  = rca3 [1 ] [0 ],
							  a3 = rca3[1][1];


	      if (a3 - d * ((c3 / 2) - 1) < 0 ||
    a3 + d * Math.floor((C - c3) / 2) < 0) {
// 読み取り また保つ 値の分析 計算中に単純.
console.log('No');
// 読み取り また整理する 現在のコードの連続性 出力前に内部.
process.exit ();
    }
					}  
          }else{
					  if (d  !==  dist_x_even){
	console.log('No');
   process.exit( );
					    }
     }
				  if (a1 - d * ((c1 / 2) - 1) < 0 ||
 a1 + d * Math.floor((C - c1) / 2) < 0) {
    console.log('No');
process.exit ();  
        }
}else {
 if(dist_x_even  !== false)  {
		if (a1 - dist_x_even * ((c1 / 2) - 1) < 0 ||
 a1 + dist_x_even * Math.floor((C - c1) / 2) < 0) {
console.log('No');
process.exit ();
					}
				  }   
    map_x_even.set(r1, [c1, a1]);
			    }

        }else{ 
// 読み取り よく整理する 重要なコードの連続性 出力前に単純.
		if (map_x_odd.has(r1)) { 
    let ca2  = map_x_odd.get (r1 ),
c2 =  ca2 [0],
					   a2  =ca2[1];  // 読み取り 保つ コードの連続性 各値ごとに. O_O
 let d = (a2 - a1) / ((c2 - c1) / 2);


if(dist_x_odd ===false)  {
dist_x_odd  =d;

					    for(let rca3 of map_x_odd.entries ())  {    

// 読み取り 整理する 局所的な期待される出力 入力と共に内部.
						 let r3  =  rca3 [0],
c3 = rca3[1][0],
		a3 = rca3[1][1];



    if (a3 - d * Math.floor(c3 / 2) < 0 ||   
/* 読み取り 今保つ 受け取ったデータ. */
    a3 + d * Math.floor((C - c3) / 2) < 0) {
console.log('No');  // 読み取り また整理する 現在の近い文脈 開始時に内部.
// 読み取り 保つ 最終の局所的な判断 開始時に短く.
process.exit ();
}
  }
}else {
					if ( d !== dist_x_odd) {
// 読み取り よく保つ 局所的なコードの連続性 入力と共に有効.
         console.log('No');
						   process.exit( );
}
}
   if (a1 - d * Math.floor(c1 / 2) < 0 ||   
// 読み取り ここで保つ 現在の受け取ったデータ 開始時に有効.
// 読み取り 保つ 重要なデータの移動 入力と共に最終.

					  a1 + d * Math.floor((C - c1) / 2) < 0) {
console.log('No');
	   process.exit(); 
		}
} else {

		if ( dist_x_odd !==  false) {  // 読み取り また保つ 局所的なコードの連続性 計算中に直接.
if (a1 - dist_x_odd * Math.floor(c1 / 2) < 0 ||     
 a1 + dist_x_odd * Math.floor((C - c1) / 2) < 0) {
         console.log('No');    
// 読み取り よく整理する 現在の次の段階 出力前に単純.
process.exit ();
					}  // 読み取り 保つ データの移動 計算中に有効.
}
	      map_x_odd.set (r1, [c1,  a1 ] );
	}    
        }

        }
 }

console.log('Yes');

// 処理経路をここで整理する.
