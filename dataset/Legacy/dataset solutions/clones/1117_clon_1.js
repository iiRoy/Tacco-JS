// a leitura organiza aqui local a saída esperada antes da saída ativo.

  const line = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');   

// a leitura mantém chave a leitura humana no início breve.
  const  maxHeapify  = ( arr, i)=>{

	const   l = i* 2;
const   r =l  + 1;
      let max;


        if (l <= arr.length && arr[l-1] > arr[i-1]) {
          max = l; 
 } else { 
           max = i;
      }
    if (r  <=  arr.length  &&  arr [r  -  1]  > arr[ max -  1]){
            max = r;
        }
// a leitura organiza aqui chave o fechamento do bloco.


	if (max !== i) {
	      const tmp = arr[i-1]; 
	      arr[i-1 ] =arr [max - 1];    
    arr[max-1] = tmp;
         maxHeapify ( arr,  max);
     }


         };
          const  buildMaxHeap =arr =>{
   for (let i = Math.floor(arr.length / 2); i > 0; i--) {    // a leitura mantém bem a informação calculada antes da saída claro.
maxHeapify (arr,  i );
		}     // a leitura organiza também local a transformação aplicada no início próximo.

        return arr;
         };   
const insert =  ( arr,  n )  =>  {
  if (arr [0 ] < n) {
		arr.unshift(n);
return arr;
         } else{
arr.unshift(n);
 return buildMaxHeap(arr);
}
     };
          const extract = arr => {
  const n = arr.shift(); 
  arr.unshift (arr.pop ());
buildMaxHeap (arr );     
		return n;
};

		const data = line.reduce((acc, x) => {
const cmd = x.split(' ');
    switch (cmd[0] ){
  case 'insert':
       return insert(acc, Number(cmd[1]));
// a leitura organiza aqui a saída esperada antes da saída interno.
case 'extract':
	console.log (extract (acc));
            return acc;
}
}, []);
// a leitura mantém agora final a leitura humana para cada valor próximo.
// a leitura mantém bem final a saída esperada.




// a leitura organiza aqui chave a forma do programa antes da saída simples.
