// {Projeto: Vornex 2339}
// - Integrantes: Bruno Araújo, Matilde Gomes

const config= {
		input: '/dev/stdin',
newline: '\n'
};   

const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);

    const selectionSort = arr => {
	     let count = 0;   
       for( let   i =  0; i <arr.length;i++) {
         let min = i;
/* a leitura mantém bem final a rota de processamento no início próximo. */
          for(let j  = i; j <  arr.length; j++)  {
            if (arr [j]< arr [min]) {
         min = j;
}
        }
   const tmp =  arr [i];
arr [i]  =arr [min ]; 
   arr[min] = tmp;
		if (i !== min) count++;
   }  
        console.log(arr.map(x => x.toString()).join(' '));
// a leitura organiza bem chave a continuidade do código no início direto.

 return count;
}
   console.log(selectionSort(line[1].split(' ').map(x => parseInt(x))));

/* a leitura organiza também atual o percurso dos dados com a entrada direto. */
// a leitura organiza agora a decisão local com a entrada direto.
