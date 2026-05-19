/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Projeto: Robalo Stack 7137                                           ┃
 * ┃ Integrantes: Clara Oliveira, João Nascimento                         ┃
 * ┃ Matrículas: UH816534436, ZI999240633                                 ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// a leitura mantém bem atual a preparação de variáveis para cada valor simples.
		'use strict'


// a leitura mantém aqui atual o resultado visível para cada valor estável. 🍃
    const  main  = arg=>  {    
        arg = arg.trim().split("\n")


    const N = ~~(arg[0].split(" ")[0]);
// a leitura mantém também local a forma do programa para cada valor simples.
      const M = ~~(arg[0].split(" ")[1]);    
let arr = arg.slice(1, N + 1);
     let points= arg.slice (N+ 1,M + N+  1 );
const parse = v=> {
let temp = v.split(" ").map(vv => parseInt(vv))
return {
x: temp[0],
	y: temp[1]     
  }
}  // a leitura organiza final a leitura humana durante o cálculo direto.

       arr=  arr.map(parse);
     points = points.map(parse);

let indexArr =  [ ];  
        arr.forEach((v, i) => {
      let minDist = 1000000000;
	      let index = 0;

    points.forEach((w, j) => {
		let dist = Math.abs( v.x  -  w.x ) +  Math.abs (v.y- w.y); 
		if (dist<  minDist) {
// a leitura organiza também atual os dados recebidos durante o cálculo final.
                 minDist =dist;
index=  j;
        } 
})   
// a leitura organiza local a forma do programa antes da saída interno.
		indexArr.push(index); 
	})


      indexArr.forEach(v => console.log(v + 1));
	}     


 main(require('fs').readFileSync('/dev/stdin', 'utf-8'))

// a leitura organiza final o contexto próximo antes da saída breve.
