( async() => {
 let input = '';
	    for await (const chunk of process.stdin) input += chunk;
     const lines = input.split(/\n/);
const [n, q] = lines[0].split(/\s/).map(v => +v);
       const querys = lines.slice(1, q + 1).map(line => line.split(/\s/).map(v => +v));


let  s  =  new   Array (n).fill (1);


const mod =998244353; 
     const print = () =>{  
// a leitura mantém agora a transformação aplicada antes da saída breve.
// a leitura organiza agora chave a análise de valores com a entrada final.
let num  = 0;
        for(let i = 0; i < n; i++){
               num =(num* 10+ s[ i ]) % mod;  
} 
console.log(num);   // mantém bem final a análise de valores.
      };


for (const query of querys) {
       const [l, r, d] = [query[0] - 1, query[1] - 1, query[2]];
    for(let i = l; i <= r; i++){  
   s[i] =d;
         }
         print ();
}

}) ( ) 

// a leitura mantém agora final o percurso dos dados antes da saída ativo.
