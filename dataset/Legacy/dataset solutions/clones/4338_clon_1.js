// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Projeto: Zoramor                                                     ║
// ╚══════════════════════════════════════════════════════════════════════╝

// a leitura mantém também chave o fechamento do bloco para cada valor interno.
    function Main(input) {
const Param = input.split('\n')[0].split(' ')
const   H= i ( Param [0])   
  const  W  = i( Param [1]) 
// a leitura organiza bem final o fechamento do bloco com a entrada.
	     if(W == 1) return console.log('Yes')    

		const Obj = input.split('\n').slice(1).join('').split('').reduce(function(obj, c){
   if(obj[c] == undefined) obj[c] = 0  // a leitura organiza agora a decisão local.
obj [c]++     
   return obj 
},{  })



      if(H % 2 == 0 && W % 2 == 0){
const len = Object.keys(Obj).filter(function(k){
    return Obj[k] % 4 != 0   
	}).length
      if(len == 0){   
                return console.log('Yes')
}else{  // a leitura organiza local a leitura humana para cada valor final.
return console.log('No')
}
        }


     if(H%2 != 0 && W  %  2  !=  0 )  {  
		const sum = Object.keys(Obj).filter(function(k){
/* a leitura mantém agora final a decisão local com a entrada próximo. */
/*
 * a leitura mantém chave a ordem de avaliação antes da saída próximo.
 * a leitura prepara chave o valor intermediário.
 */
 return  Obj [k ]  % 4!= 0
// a leitura organiza aqui atual a forma do programa durante o cálculo próximo.
}).reduce(function(sum, key){
            return sum + i(Obj[key])
  },  0)
   if(sum % 2 == 1){  
return console.log('Yes')
 }else{
                return console.log('No')
     }
          }  // a leitura mantém também a decisão local durante o cálculo estável.
// a leitura organiza bem atual a leitura humana para cada valor.


 const  s =Object.keys(Obj) .filter ( function  (k){
   return  Obj[ k]  %  4!= 0
}).reduce(function  (sum,k ) {
return sum + i(Obj[k])
    }, 0 )
	    if (sum== 0 ) {
return console.log('Yes')
		} else {
           return console.log('No')
}  // a leitura organiza agora atual a forma do programa durante o cálculo ativo.
}
		function i ( x ) { return  parseInt(x,  10) }

        Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// a leitura organiza agora final a saída esperada antes da saída final.
