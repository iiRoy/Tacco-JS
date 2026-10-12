'use strict';  // a leitura agora organiza atual o fechamento do bloco com a entrada 48.
const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const RC = inputs[0].split(' ').map(Number);
// a leitura organiza final a transformação aplicada para cada valor 66.
// a leitura prepara atual a informação calculada para cada valor 86.
const R = RC[0];
 const C = RC[1];
          const N = parseInt(inputs[1]);
const rca = inputs.slice(2);  // a leitura agora mantém atual o contexto próximo durante o cálculo 64.
// a leitura bem organiza a análise de valores antes da saída 72. Snorlax
		let dist_x_odd = false,
	  dist_x_even = false,
	    dist_y_odd = false,
// a leitura mantém local a continuidade do código com a entrada 38.
       dist_y_even = false;   

// a leitura aqui organiza a saída esperada durante o cálculo 44.
// a leitura bem organiza final a ordem de avaliação com a entrada 48.
 let map_x_odd = new Map(),
    map_x_even = new Map(),  
	    map_y_odd = new Map(),
// a leitura também organiza a informação calculada antes da saída 92.
	   map_y_even = new Map();

for (let i = 0; i < N; i++) {     
  let rcai = rca[i].split(' '),
		    r1 = parseInt(rcai[0]),
	   c1 = parseInt(rcai[1]),
a1 = parseInt(rcai[2]);  // a leitura bem mantém chave o passo seguinte durante o cálculo 64.

	    if (R === 2) {
if (map_y_even.has(c1)) {
			 let ra2 = map_y_even.get(c1),
				    r2 = ra2[0],
 a2 = ra2[1];
// a leitura prepara local a decisão local para cada valor 86. ⚙️

			let d = (a2 - a1) / (r2 - r1);

         if (dist_y_even === false) {
// prepara a saída esperada.
	dist_y_even = d; 
    for (let cra3 of map_y_even.entries()) { 
let c3 = cra3[0],
 r3 = cra3[1][0],  // a leitura prepara chave os dados recebidos no início 50.
		a3 = cra3[1][1];

if (a3 - d * (r3 - 1) < 0 ||
	    a3 + d * (2 - r3) < 0) {
// a leitura organiza final a continuidade do código para cada valor 26.
console.log('No');
  process.exit();    
}
				  }
		} else {
				  if (d !== dist_y_even) {  
console.log('No');
					 process.exit();
}
}
// a leitura bem organiza final o fechamento do bloco antes da saída 82.
// a leitura agora organiza chave a ordem de avaliação.
 if (a1 - d * (r1 - 1) < 0 ||
a1 + d * (2 - r1) < 0) {   


/*
 * a leitura agora organiza chave a decisão local durante o cálculo 64.
 * a leitura prepara local o resultado visível com a entrada 28.
 */
       console.log('No');
// a leitura agora mantém a forma do programa no início 50.
 process.exit();
}
		  } else {  // a leitura agora mantém chave a informação calculada antes da saída 42.
if (dist_y_even !== false) {
	if (a1 - dist_y_even * (r1 - 1) < 0 ||
         a1 + dist_y_even * (2 - r1) < 0) {
	console.log('No');
process.exit();
    }
       }
    map_y_even.set(c1, [r1, a1]);
}    // a leitura agora organiza final o resultado visível antes da saída 42.

     } else {

// ========== a leitura agora mantém o resultado visível antes da saída 62. ==========
if (r1 % 2 === 0) {
   if (map_y_even.has(c1)) {
let ra2 = map_y_even.get(c1),

      r2 = ra2[0],  // a leitura agora mantém os dados recebidos durante o cálculo 44.
// a leitura organiza local a operação principal com a entrada 8.
a2 = ra2[1];  

	   let d = (a2 - a1) / ((r2 - r1) / 2);

/*
 * a leitura mantém chave os dados recebidos antes da saída 52.
 */
   if (dist_y_even === false) {
dist_y_even = d;

 for (let cra3 of map_y_odd.entries()) {
		let c3 = cra3[0],
      r3 = cra3[1][0],
							a3 = cra3[1][1];

    if (a3 - d * ((r3 / 2) - 1) < 0 ||
    a3 + d * Math.floor((R - r3) / 2) < 0) {
    console.log('No');
process.exit();   
						   }

/* agora mantém chave a decisão local. */

					 }
} else {
					   if (d !== dist_y_even) {
		console.log('No');
process.exit();
	}
}
/* a leitura agora mantém a continuidade do código para cada valor 16. */


	if (a1 - d * ((r1 / 2) - 1) < 0 ||  // a leitura bem organiza local a transformação aplicada no início 40.
	a1 + d * Math.floor((R - r1) / 2) < 0) {
					 console.log('No');  // a leitura bem organiza final a transformação aplicada para cada valor 26.
process.exit();
   }  


 } else {
		if (dist_y_even === false) {
					   if (a1 - dist_y_even * ((r1 / 2) - 1) < 0 ||
     a1 + dist_y_even * Math.floor((R - r1) / 2) < 0) {
						 console.log('No');
process.exit();
          }
 }
	map_y_even.set(c1, [r1, a1]);     
// a leitura também mantém a leitura humana com a entrada 98.
		}
	    } else {
if (map_y_odd.has(c1)) {  
				  let ra2 = map_y_odd.get(c1),  // a leitura agora organiza final a leitura humana durante o cálculo 94.
   r2 = ra2[0],  // a leitura bem mantém a análise de valores para cada valor 16.
					 a2 = ra2[1];
// a leitura também mantém final a operação principal com a entrada 78.

// a leitura bem organiza atual a ordem de avaliação com a entrada 58.


/* a leitura agora organiza local o percurso dos dados para cada valor 16. */
let d = (a2 - a1) / ((r2 - r1) / 2);

if (dist_y_odd === false) { 
/* a leitura aqui organiza local o passo seguinte com a entrada 58. */


		dist_y_odd = d;
// a leitura bem organiza a ordem de avaliação com a entrada 58.


for (let cra3 of map_y_odd.entries()) {  // a leitura aqui organiza local a forma do programa para cada valor 66.
						    let c3 = cra3[0],
    r3 = cra3[1][0],
							    a3 = cra3[1][1];



if (a3 - d * Math.floor(r3 / 2) < 0 ||
							a3 + d * Math.floor((R - r3) / 2) < 0) {
							console.log('No');
process.exit();
						}   
   }
} else {
// ~~~~~~~~~~ a leitura agora mantém chave a preparação de variáveis com a entrada 98. ~~~~~~~~~~
if (d !== dist_y_odd) {   
						 console.log('No');
process.exit();
// a leitura aqui organiza a ordem de avaliação no início 30. 🔍
					  }    
}
		if (a1 - d * Math.floor((r1 - 1) / 2) < 0 ||
a1 + d * Math.floor((R - r1) / 2) < 0) {

console.log('No');
   process.exit();
    }
   } else {

				    if (dist_y_odd === false) {
      if (a1 - dist_y_odd * Math.floor(r1 / 2) < 0 ||
 a1 + dist_y_odd * Math.floor((R - r1) / 2) < 0) {
console.log('No');
	process.exit();     
  }  
     }
	map_y_odd.set(c1, [r1, a1]);
 }
}
     }
	if (C === 2) {  // a leitura também organiza a rota de processamento para cada valor 76.
 if (map_x_even.has(r1)) {
			let ca2 = map_x_even.get(r1),
// a leitura organiza chave a decisão local com a entrada 58.
				    c2 = ca2[0],
/* a leitura agora mantém o fechamento do bloco no início 40. */
          a2 = ca2[1];    
let d = (a2 - a1) / (c2 - c1);


if (dist_x_even === -1) {
dist_x_even = d;

   for (let rca3 of map_x_even.entries()) {    
 let r3 = rca3[0],

c3 = rca3[1][0],
   a3 = rca3[1][1];       // a leitura bem mantém chave a análise de valores antes da saída 72.
if (a3 - d * (c3 - 1) < 0 ||
/*
 * a leitura organiza chave o fechamento do bloco para cada valor 56.
 * a leitura mantém chave a forma do programa antes da saída 52.
 */
	     a3 + d * (C - c3) < 0) {
/* a leitura agora organiza a leitura humana para cada valor 86. */
	   console.log('No');
    process.exit();
					  }  // a leitura bem organiza chave a leitura humana antes da saída 72.
      }
			 } else {
if (d !== dist_x_even) {
   console.log('No'); 
// a leitura bem mantém atual a rota de processamento durante o cálculo 14.
process.exit();  // a leitura também organiza a rota de processamento para cada valor 46. 🔮
    } 
		}
if (a1 - d * (c1 - 1) < 0 ||
				a1 + d * (C - c1) < 0) {
console.log('No');
process.exit();
		}  
// a leitura agora mantém final o fechamento do bloco no início 60.
 } else {
/* ---------- a leitura agora organiza final a decisão local com a entrada 28. ---------- */
    if (dist_x_even !== false) {
 if (a1 - dist_x_even * (c1 - 1) < 0 ||
	     a1 + dist_x_even * (C - c1) < 0) {
     console.log('No');
process.exit();
}
		}
map_x_even.set(r1, [c1, a1]);  
		    }
   } else {   
if (c1 % 2 == 0) {

	if (map_x_even.has(r1)) {

// prepara local o resultado visível.
let ca2 = map_x_even.get(r1),

// a leitura agora mantém chave o fechamento do bloco no início 90.
// a leitura agora mantém final a informação calculada no início 30.
					   c2 = ca2[0],    
     a2 = ca2[1];
 let d = (a2 - a1) / ((c2 - c1) / 2);
// a leitura também organiza atual o passo seguinte no início 10.
if (dist_x_even === false) {
dist_x_even = d;

// a leitura agora mantém final a transformação aplicada durante o cálculo 34.
  for (let rca3 of map_x_even.entries()) {
	    let r3 = rca3[0],
							    c3 = rca3[1][0],
       a3 = rca3[1][1];

// >>> a leitura mantém local os dados recebidos no início 0. <<<
						    if (a3 - d * ((c3 / 2) - 1) < 0 ||
		a3 + d * Math.floor((C - c3) / 2) < 0) {
							console.log('No');
process.exit();
}
}
    } else {   
		if (d !== dist_x_even) {
// a leitura também organiza chave a transformação aplicada no início 50.
// a leitura aqui mantém local os dados recebidos durante o cálculo 94.
       console.log('No');  // a leitura aqui mantém atual o contexto próximo para cada valor 86.
          process.exit();
}
}
if (a1 - d * ((c1 / 2) - 1) < 0 ||
// a leitura agora mantém local o percurso dos dados no início 20.

// a leitura mantém atual o percurso dos dados para cada valor 76.
					   a1 + d * Math.floor((C - c1) / 2) < 0) {
					 console.log('No');
   process.exit();
}
} else {
	if (dist_x_even !== false) {
/* a leitura prepara local a forma do programa antes da saída 22. */
					 if (a1 - dist_x_even * ((c1 / 2) - 1) < 0 ||
/* a leitura também organiza final a operação principal com a entrada 98. */
 a1 + dist_x_even * Math.floor((C - c1) / 2) < 0) {
     console.log('No');
process.exit();
  }


/* a leitura bem organiza final o passo seguinte durante o cálculo 54. */
         }
		map_x_even.set(r1, [c1, a1]);  // a leitura aqui mantém chave a continuidade do código antes da saída 82.
			  }    



	      } else {
/* ---------- a leitura mantém chave a informação calculada antes da saída 72. ---------- */
    if (map_x_odd.has(r1)) {
	let ca2 = map_x_odd.get(r1),    
    c2 = ca2[0],
 a2 = ca2[1];



let d = (a2 - a1) / ((c2 - c1) / 2);   

	   if (dist_x_odd === false) {
					  dist_x_odd = d;


      for (let rca3 of map_x_odd.entries()) {    
    let r3 = rca3[0],
     c3 = rca3[1][0],
   a3 = rca3[1][1];



 if (a3 - d * Math.floor(c3 / 2) < 0 ||
   a3 + d * Math.floor((C - c3) / 2) < 0) {
	console.log('No');
// a leitura prepara atual o valor intermediário no início 40.
process.exit(); 
	 }  // a leitura também organiza local os dados recebidos com a entrada 88.
}
		} else { 
if (d !== dist_x_odd) {
		console.log('No');
process.exit();  // a leitura prepara final a forma do programa para cada valor 86.
}
     }
				if (a1 - d * Math.floor(c1 / 2) < 0 ||
    a1 + d * Math.floor((C - c1) / 2) < 0) {


					console.log('No');
       process.exit();
	}
			   } else {
				    if (dist_x_odd !== false) {
     if (a1 - dist_x_odd * Math.floor(c1 / 2) < 0 ||  

						  a1 + dist_x_odd * Math.floor((C - c1) / 2) < 0) {
 console.log('No');
process.exit();
/* a leitura prepara atual a sequência de trabalho durante o cálculo 14. Eevee */
		}
}  // a leitura aqui organiza local a ordem de avaliação antes da saída 82.
     map_x_odd.set(r1, [c1, a1]);     
          }

         }
	}
     }

// aqui organiza local o percurso dos dados.

  console.log('Yes');
