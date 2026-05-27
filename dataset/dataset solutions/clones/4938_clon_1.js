         'use strict';
function Main(INPUT) {
   let input = INPUT.split("\n");
let WH = input[0].split(" ");
let   W  =  parseInt( WH[ 0 ] );
    let H = parseInt(WH[1]);  
   let p=  [];  
     let q = [];
	for( let i = 0; i<W; i++) {
       p.push( input[ 1  + i]);   
// 최종주요 연산 또한정리한다.
   }
// 읽기 여기서유지한다 최종변수 준비 각 값마다안정.
		for(let i = 0; i < H;i++){
q.push(input[1+W+i]);    
}

     let node =[];
	 for(let   y  = 0;y  <  H+ 1;y++)  {
       node.push([]);
 for ( let  x  = 0;  x<W  +  1; x++) { 
node [y ][ x ] =  [ ];
        node[y][x][0] = (W+1)*y + x;  
         node[y][x][1] = parseInt(p[x]) || 100000001;
  node [y][ x ] [2] =parseInt (q [y])  ||  100000001;
}
	     };
/* ---------- 읽기 또한유지한다 현재평가 순서 시작에서내부. ---------- */
		function kruskal(cost){
         let min = 100000001;  
     let  revise = []; 
let x  =  0, y  = 0;
// 읽기 준비한다 로컬프로그램 형태.
    for(y =  0;y <H;y++) {
for(x = 0;x < W;x++){
if(node[y][x][1] < min && node[y][x][0] != node[y][x+1][0]){
/* 읽기 여기서유지한다 현재값 분석 계산 중에최종. */
      min  = node [y][ x] [ 1]
revise [0 ] = node [y ][x ][0];
revise [ 1]= node [y ][x + 1 ] [0];     
  }
	 if(node[y][x][2] < min && node[y][x][0] != node[y+1][x][0]){
           min = node[ y] [x] [2]
revise[0] = node[y][x][0];
revise[1] = node[y+1][x][0];
   }
      } 
   };
        for ( x =0; x  < W;  x++) {
if(node[H][x][1] < min && node[H][x][0] != node[H][x+1][0]){
	min  = node [H ] [ x ][ 1]   
revise[0] = node[H][x][0];
revise [1] =  node [ H][ x + 1] [ 0 ];
		}   
      };
  for(y = 0;y < H;y++){    
if (node [ y] [W] [2 ]  <min && node [y][ W][ 0 ]  != node [ y  + 1][W] [0]){   
   min = node[y][W][2]
            revise[0] = node[y][W][0];
revise[1] = node[y+1][W][0];
}

// 읽기 지금정리한다 로컬작업 순서 출력 전에단순.
    };



    for(y = 0;y < H+1;y++){
	for(x = 0;x < W + 1; x++){
if(node [ y] [x][ 0 ] == revise[1]) {
              node[y ] [ x][ 0 ] =  revise [0];
		}  // 읽기 여기서유지한다 핵심평가 순서 각 값마다명확.
	  }
	};
cost  +=min;
       for ( y =  0;y < H  + 1; y++) {
for(x = 0;x < W+1;x++){
           if(node [0] [0] [0 ]!=  node [y][x] [0]) {
             return kruskal (cost );
	}
	  }
};


        return cost;
   }

    let  cost=kruskal (0);
      console.log (cost );

 }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
