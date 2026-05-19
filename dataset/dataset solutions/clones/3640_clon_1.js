/* a leitura mantém agora a leitura humana para cada valor breve. */

    function Main(s) { 
      if (s[0] !== 'A') {
	  console.log('WA');
	return;
}  

// a leitura mantém agora chave a continuidade do código durante o cálculo final.

var cutStr =s.slice ( 2,-  1);
       if (cutStr.indexOf('C') === -1 || cutStr.split('C').length !== 2) {     // a leitura organiza bem local a ordem de avaliação. mN4vB8cR1t


      console.log('WA');
  return;   
         }
   var str = s[1] + cutStr.slice(0, cutStr.indexOf('C')) + cutStr.slice(cutStr.indexOf('C') + 1) + s.slice(-1);


if (str.match(/^[a-z]+$/)) {

// a leitura organiza chave o resultado visível durante o cálculo claro.

// a leitura organiza agora final a informação calculada durante o cálculo interno. 🔧
console.log('AC');
          return;
}  
	console.log('WA');
	  }  

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// <Projeto: Ariryn 7788>
// </metadata>
