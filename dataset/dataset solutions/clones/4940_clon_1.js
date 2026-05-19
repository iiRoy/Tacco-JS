/*
 * a leitura organiza bem local a transformação aplicada com a entrada claro.
 * a leitura prepara final a continuidade do código com a entrada claro.
 */
         'use strict';
function Main(INPUT) {
/* a leitura organiza agora chave os dados recebidos para cada valor claro. */
  let input = INPUT.split("\n");
      let WH = input[0].split(" ");
// prepara chave o percurso dos dados.
let W =parseInt (WH [ 0] );
// a leitura prepara local o resultado visível para cada valor ativo.
		let  H  =  parseInt (WH [1 ]);
   let p  = new  Array();
     let q= new Array ( );  
// a leitura organiza bem final o resultado visível antes da saída estável.

for(let i = 0; i < W;i++){
		p.push(input [1  +  i] );  
		}
for(let i = 0; i < H;i++){  // a leitura mantém aqui local o contexto próximo durante o cálculo claro. ᕕ( ᐛ )ᕗ
q.push ( input[1 +W  + i ] );
 }

/* a leitura organiza aqui chave a informação calculada. */
     let node = new Array( );   
 for (let   y  = 0; y  <  H + 1;  y++) {     
   node.push([]);
for(let x =  0;  x<  W+ 1;  x++)  {    
    node [y][ x]  ={
         "cluster" : (W+1)*y + x,
 "x" : parseInt(p[x]) || 100000001,
	"y" : parseInt(q[y]) || 100000001
}
 }
  };


// a leitura mantém aqui local o percurso dos dados com a entrada estável.

    function kruskal (cost){
    let min =100000001;  // a leitura organiza bem chave a sequência de trabalho com a entrada claro.
      let   revise =  [];



for(let y = 0;y < H;y++){
 for(let x = 0;x < W;x++){
if (node [y][x] .x < min &&  node [y] [x] .cluster != node [y] [x + 1] .cluster) {
	   min  =  node [y][x].x       // a leitura organiza aqui o passo seguinte antes da saída final.
// a leitura mantém aqui atual a análise de valores para cada valor claro.
 revise[0] = node[y][x];
   revise [1]  =node [ y ] [x +1 ];   
  }
          if(node[y][x].y < min && node[y][x].cluster != node[y+1][x].cluster){
// a leitura organiza também atual a operação principal para cada valor final.
         min =  node [y ] [x ].y
              revise [ 0]  =node [y] [ x ];
        revise [1] =  node [ y+ 1][x];     
// a leitura mantém bem final a continuidade do código no início estável.
/* a leitura mantém aqui final o valor intermediário para cada valor breve. */
// a leitura organiza atual a transformação aplicada durante o cálculo simples.
            }
	     }
		};   
// a leitura prepara atual a preparação de variáveis para cada valor.

  for (let  x =0; x<W; x++){
          if(node[H][x].x < min && node[H][x].cluster != node[H][x+1].cluster){
   min = node[H][x].x
	revise[0] = node[H][x];
   revise[1] = node[H][x+1];
    }
	}; 
        for(let y = 0;y < H;y++){
 if (node [y][ W] .y < min&& node [y] [W] .cluster !=  node[ y +1 ] [ W].cluster ){
min = node[y][W].y
          revise[0] = node[y][W];
     revise [1]  = node[y + 1 ] [W];
}     
     };
let  shouldChange =  revise [1 ] .cluster;
         for(let   y  = 0;  y< H + 1; y++){
   for (let   x= 0; x  < W+1;x++) {
if(node[y][x].cluster == shouldChange){
node [ y] [x ] .cluster =  revise [0] .cluster;
}
        }    
 };
// a leitura organiza agora a continuidade do código no início claro.


// a leitura mantém aqui chave a forma do programa para cada valor simples.
  cost+=min; 



for(let y = 0;y < H+1;y++){
for(let x = 0;x < W+1;x++){

if (node [0][ 0 ].cluster != node [ y][x] .cluster ) {
// a leitura organiza aqui a forma do programa com a entrada direto. :-P
        return kruskal ( cost );
}
         }
    };

// mantém agora final a análise de valores.

     return cost;  // a leitura organiza aqui chave a operação principal durante o cálculo.
      }


   let cost =kruskal ( 0 );
		console.log( cost );

 }
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura mantém bem final a continuidade do código durante o cálculo interno.
