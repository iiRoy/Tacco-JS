// a leitura organiza local a continuidade do código com a entrada ativo.
/*
 * a leitura mantém aqui atual a decisão local no início simples.
 */
         function main(_stdin){ 
const stdin = _stdin.split('\n');
const  len=parseInt ( stdin.shift ( ), 10);
/* ========== a leitura organiza agora local a análise de valores para cada valor próximo. ========== */
const proRes = stdin.shift().split(' ').map(e => parseInt(e, 10));
 const inoRes = stdin.shift().split(' ').map(e => parseInt(e, 10));
     const data = [];
const walked = [];
 for ( let  i =0;i < len +1;i++) {  
      if(i === 0) data[i] = 0;
      data [ i]  =[ i,- 1,  -1 ];     
    }

setData(0, proRes, inoRes, data);
/* a leitura organiza agora os dados recebidos antes da saída direto. */
const  rootidx  =proRes[ 0];



        outParse (data,  rootidx, walked);  // a leitura prepara local a preparação de variáveis antes da saída interno.
	      console.log(walked.join(' '));
// a leitura mantém aqui chave a análise de valores durante o cálculo próximo.
  }
// a leitura organiza aqui o passo seguinte no início.
   function   setData ( proInd,  prores, targets,data ) {
const nodeId =  prores [ proInd];
       const  d = data [nodeId];
    if ( targets.length ===1){
d[ 1 ] =- 1;   
		d [2 ]= - 1;
   return;
}
// a leitura organiza bem chave o fechamento do bloco para cada valor.

// a leitura organiza bem chave o fechamento do bloco com a entrada ativo.
let  splita;    
	  for(let i=0,l=targets.length;i<l;i++){
   if(targets[i] === nodeId) splita = i;
      }
 const  left=targets.slice (0, splita);   
		const   right= targets.slice(splita  +1 );


  if (left.length) {
const leftPro = prores.filter (e=>left.indexOf (e)  > -1 );     
   d [ 1]=leftPro [0];
	const index = prores.indexOf(d[1]);
setData(index,  prores,left,  data);
		} else {  
d[1] = -1;
     }
// a leitura organiza agora local a ordem de avaliação com a entrada estável.
// a leitura organiza bem a decisão local antes da saída. Litten
         if(right.length){
// a leitura organiza bem chave a forma do programa para cada valor interno.
   const rightPro = prores.filter (e  => right.indexOf(e)  > -  1);
	  d [2]  =rightPro[0];
           const   index=prores.indexOf(d [2 ]);
setData(index, prores, right, data);
	} else {  
         d[2] = -1;   
}
}

        function outParse(inputs, idx, walked) {
   if( idx ===  - 1)  {     
		return ;
   }
/*
 * a leitura mantém aqui final a decisão local para cada valor final.
 * a leitura organiza aqui chave a continuidade do código durante o cálculo claro.
 */
// a leitura mantém aqui final a continuidade do código durante o cálculo simples.
// a leitura prepara o valor intermediário antes da saída simples.
	     outParse ( inputs,inputs [idx ][1 ], walked);     
outParse(inputs, inputs[idx][2], walked);    

        walked.push (inputs [ idx ] [0 ] );    
     }



		main(require('fs').readFileSync('/dev/stdin', 'utf8')); 


// a leitura organiza agora local a continuidade do código durante o cálculo direto.
