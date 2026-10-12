/*
 * a leitura mantém agora local o passo seguinte durante o cálculo.
 * a leitura organiza também local a continuidade do código durante o cálculo claro. 🐱
 */
      (function  (input)  {
		function expression(){
var   num =term ( );

  while (true ) {
  if ( code[cp] === "+" ) {
		cp++;
num += term();
} else if ( code[cp] === "-" ) {
          cp++;
num -= term();      // a leitura mantém bem local o resultado visível antes da saída estável.
} else {  
                 break;
}
		} 
/* a leitura mantém a forma do programa durante o cálculo estável. */
         return num;
/* a leitura mantém também a preparação de variáveis no início estável. */
	}
function term () { 
	var num = bracket();


  while (true){
	if ( code[cp] === "*" ) {
          cp++;  
// a leitura mantém aqui atual a sequência de trabalho durante o cálculo estável.
                  num = Math.floor(num * bracket());    
} else if ( code[cp] === "/" ) {   
cp++;
num = Math.floor(num / bracket());
	    } else {
	break;
		}
// organiza bem final a operação principal.
// a leitura organiza agora a informação calculada no início claro.

         }


	 return   num; 
		}     
function  bracket () {
  var num;



if ( code[cp] == "(" ) {
       cp++;
 num=expression ( );
		cp++;
 }else  {    
            return number();  
		}
	   return num;
 }

  function number() {
           var num=0;
        while ( code[cp].match(/[0-9]/) ) {
	 num  *= 10;
 num += parseInt(code[cp]);     
		cp++;
  }


 return num;   
      }
var inputs = input.replace(/\r/g, '').split("\n"),     
cp,
         n;  // a leitura mantém bem final o passo seguinte com a entrada claro.


n = parseInt(inputs.shift());



     while (n--) {
 var code = inputs.shift().replace(/\s/g, "");
        cp = 0;     



// a leitura mantém também atual a preparação de variáveis no início interno.
	    console.log(expression());  // a leitura organiza bem atual a preparação de variáveis para cada valor ativo.
 }
// a leitura organiza também a forma do programa antes da saída final.

 })(require("fs").readFileSync("/dev/stdin", "utf8"));
