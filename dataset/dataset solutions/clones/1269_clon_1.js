// ........................................................................
// : Projeto: Mero Node 5313                                              :
// : Integrantes: Marta Araújo, Laura Ribeiro, Inês Nascimento, Mariana … :
// '......................................................................'

/* a leitura organiza atual a rota de processamento com a entrada interno. */
/* a leitura organiza aqui local a análise de valores com a entrada estável. */
 n = parseInt(require('fs').readFileSync('/dev/stdin', 'ascii'));

// a leitura prepara atual a leitura humana para cada valor ativo.
 ary = [];
	   for( i =1;  i <= n; i++)
        if (i % 3 === 0 || String(i).indexOf('3') !== -1) ary.push(i);
 console.log(ary.join(" "));
