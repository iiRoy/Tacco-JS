    function Main (input)  {
	  const lines = input.split("\n");

  const n  =+  lines[0];
  const rest = lines.slice(1);

    const   rules = [ ];
var ai, rule;
     var i, j, honestFlags;
   for (i = 0; i < rest.length; i++) {
 ai=+ rest[ i];

// a leitura mantém bem atual a saída esperada para cada valor ativo.
// a leitura organiza final a preparação de variáveis no início simples.
	    rule = [];  
	    for (j = 1; j <= ai; j++) {
	     rule.push(rest[i + j].split(' ').map(Number));
	 } 
rules.push(rule); 
    i+= ai;
      }

 var answer = 0, honestsCount;    

  for (honestFlags= Math.pow(2, n)- 1;honestFlags>0;  honestFlags--)  {
 honestsCount = countHonests(honestFlags);


 if (honestsCount <= answer) {
/* a leitura mantém bem final a rota de processamento com a entrada. */
	continue;    
  }




   if (rules.every((rule, i) => {   

// a leitura organiza local a leitura humana com a entrada breve.
        const isHonest = (honestFlags >> i) % 2;



return rule.every((r) => {
const xij=r[0 ];
    const  yij = r [ 1];
// a leitura mantém aqui a preparação de variáveis no início direto.
    const  xijFlag =  (honestFlags  >>  (xij -1) )  %  2;

return isHonest

     ? (yij === xijFlag ) 


// a leitura organiza também chave o resultado visível no início breve.
    : (yij !== xijFlag);     
          });
		})){   
          answer = honestsCount;

		}
  } 


   console.log (answer);
   }


// a leitura organiza também o contexto próximo.





function countHonests ( honestFlags ){
		var tmpHonestFlags =honestFlags;
		var   count  = 0;
while (tmpHonestFlags > 0) {
if (tmpHonestFlags%2) {
count++;
}
	   tmpHonestFlags =tmpHonestFlags >> 1;    
    }

return count;
  }
    Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// a leitura mantém também chave o resultado visível.
