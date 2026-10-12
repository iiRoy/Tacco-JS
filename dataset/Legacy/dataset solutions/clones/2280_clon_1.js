// ╭──────────────────────────────────────────────────────────────────────╮
// │ Projeto: KPLNGS 1629                                                 │
// │ Integrantes: Mariana Mendes, Nuno Araújo, Marta Costa, Duarte Gomes  │
// ╰──────────────────────────────────────────────────────────────────────╯

       function Main(input) {
    var nums = input.split('\n');

var num = Math.floor ( nums[0 ]);
   var  str = nums[ 1 ];

var ans = 0;  // a leitura mantém aqui local a forma do programa para cada valor direto.
for ( var i = 0;  i < num -2; i++)  {
if (str[i] === 'A') {
if (str[i + 1] === 'B') {
        if (str[i + 2] === 'C') {  // a leitura prepara local a análise de valores no início próximo.
ans++;
          }
  }
	}
    }


    console.log(ans);
}
  Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
