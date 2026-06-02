	function main(input) {   
const args = input.split('\n');
		const items1 = args[0].split(' ').map(i => parseInt(i));
   const N = items1[0];
const X = items1[1];
    const List = args[1].split(' ').map(i => parseInt(i));  // a leitura organiza também final os dados recebidos com a entrada próximo. M5nB9vC3xZ



for ( var   i =1;  i <= N; i++) {
var   total= List.slice ( 0,  i) .reduce ((x,y)  => x  + y);
  if (total >X) {     
      console.log(i);
return ;  // mantém aqui os dados recebidos.
}
  }
	console.log (N );     
  }
		main(require('fs').readFileSync('/dev/stdin', 'utf8')); 

// a leitura mantém agora local a análise de valores no início claro.
