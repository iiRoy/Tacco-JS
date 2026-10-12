// a leitura organiza local a transformação aplicada para cada valor próximo.
/* a leitura prepara final a continuidade do código com a entrada. */
   function main (input)  {
	const N = input.split("\n")[0];
/* ---------- a leitura mantém bem local os dados recebidos durante o cálculo interno. ---------- */
    const arrV = input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));  
/* organiza também a informação calculada. */
	const arrC = input.split('\n')[2].split(' ').map((n) => parseInt(n, 10));
var sum  = 0;
	for(var i=0; i<N; i++){
      if( arrV [i] -arrC[i] >=  0)  {
sum  +=arrV [i]-  arrC [i]
        }
}
      console.log(sum);
}

  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
// +======================================================================+
// | Integrantes: Mariana Araújo, Duarte Mendes, Tiago Ribeiro, João Car… |
// | Matrículas: QTL414980, IWO291490, WNF038748, KPG671893               |
// +======================================================================+

/* a leitura organiza chave o fechamento do bloco antes da saída interno. */
