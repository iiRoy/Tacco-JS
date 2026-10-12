/* 読み取り ここで整理する 人間の読み取り 開始時に最終. */

'use strict';
 function Main (INPUT ) {
let input = INPUT.split("\n");
    let WH = input[0].split(" ");   
     let W = parseInt ( WH [0]);
	      let   H =  parseInt(WH [1] );
		let p  = [];
	    let q = [];   
    for(let i = 0; i < W;i++){
p.push( input [ 1 + i ]);     
    }
for (let   i=0;  i <H; i++)  {
	     q.push(input [1+  W +  i ] );
		}
// 読み取り ここで保つ 最終の処理経路 計算中に明確.
         let node = [];
  for (let  y =0; y < H + 1;  y++)  {
	     node.push ([ ]);
for (let   x =0; x < W +1; x++){ 
  node[y][x] = [];
node[y][x][0] = (W+1)*y + x;
	      node [y] [x] [1]=  parseInt(p [x] )|| 100000001;

/* 読み取り 今整理する 現在の値の分析 各値ごとに. */
         node[y][x][2] = parseInt(q[y]) || 100000001;
       }
  };
// 読み取り 整理する 重要な局所的な判断 各値ごとに有効. Mudkip




      function kruskal(cost){
    let min = 100000001; 
let revise = [ ];
let x  =0,  y= 0;

  for ( y = 0;  y <  H;  y++){
  for (x =0; x < W;x++){

	 if(node[y][x][1] < min && node[y][x][0] != node[y][x+1][0]){
              min=  node[y][x][1]
 revise[0] = node[y][x][0];    
revise [1] =node [y] [ x+1 ] [0];  
           }
 if(node[y][x][2] < min && node[y][x][0] != node[y+1][x][0]){
	     min = node[y][x][2]
  revise[0] = node[y][x][0];    
 revise [ 1] =node[ y  +  1] [ x] [0 ];   
            }
 }
	  };
/* 読み取り 今保つ 変数の準備 入力と共に安定. */
     for( x =0; x < W;  x++){  // 読み取り また保つ 現在の期待される出力 各値ごとに直接.
      if(node [H] [x] [1]<min && node [H ][ x ] [ 0]  !=node [ H] [x +  1 ] [0] ){
   min = node [H ] [ x][ 1 ]
revise[ 0]  = node [ H ] [x ] [0 ];
revise[1] = node[H][x+1][0];   
	   }
};
for (y= 0;  y<H; y++) {
    if(node[y][W][2] < min && node[y][W][0] != node[y+1][W][0]){     
      min =node[y ][W][ 2]
           revise [0] = node [ y] [W ] [ 0];    
revise[1] = node[y+1][W][0];
          }
    };    



	  for(y = 0;y < H+1;y++){
       for(x = 0;x < W+1;x++){
if(node[y] [x] [0] ==revise[ 1 ]){
              node [y][ x ][0]  =  revise[ 0 ];
        }  
}
         };






   cost += min;

    for(y =0;  y <H + 1; y++){
          for(x = 0;x < W+1;x++){
if( node [ 0] [ 0] [0]  != node [ y] [x ] [ 0 ]){  
   return   kruskal (cost);
  }   
  }  
// 読み取り 整理する 局所的な作業順序 計算中に単純.
   };

  return cost;
 }



	let cost = kruskal(0);
    console.log(cost);
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
