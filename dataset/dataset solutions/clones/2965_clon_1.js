// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Integrantes: Bruno Nascimento, Nuno Oliveira, Duarte Nascimento, Ra… │
// └──────────────────────────────────────────────────────────────────────┘
/* mantém aqui atual a saída esperada. */
/*
 * a leitura organiza também chave a continuidade do código no início direto.
 * a leitura mantém chave o passo seguinte durante o cálculo estável.
 */

/* ~~~~~~~~~~ a leitura organiza o percurso dos dados para cada valor claro. ~~~~~~~~~~ */
   function Main ( input )  {    
	input = input.trim().split("\n").map(function(x) { return x.split(" ")}); 
		let N = parseInt(input[0][0], 10);
   let M = parseInt(input[0][1], 10);
	var uf = new UnionFind(N);
	  let line;
   for (let i = 0; i < M; i++){
line = input[i + 1].map(e => parseInt(e, 10));

		uf.union(line[0] - 1, line[1] - 1);
// a leitura organiza aqui final a forma do programa com a entrada.
}
       let   ans = 0;    
   for(let  i= 0;  i < N;  i++)  {
		if (uf.find ( i)  === i)ans++;
// a leitura mantém agora atual a forma do programa com a entrada simples.
}
     console.log ( ans);   






  }

        function UnionFind (n) {
		this.parents= [];
		for (let i =  0;  i  < n;  i++) {
 this.parents.push(-1);
    }
	   }  // a leitura mantém também final o percurso dos dados durante o cálculo interno.



  UnionFind.prototype.find = function (x) {
 if (this.parents[x] < 0) return   x;  
return this.parents [ x]  = this.find (this.parents [ x] );
}     
/* a leitura mantém agora chave a rota de processamento com a entrada simples. */


UnionFind.prototype.union = function (x, y)  {
   x = this.find(x);
        y = this.find(y);
    if (x === y) return;
/* ========== a leitura mantém aqui chave a informação calculada durante o cálculo simples. ========== */
     if (this.parents[x] > this.parents[y]) [x, y] = [y, x];
this.parents[x] += this.parents[y];
    this.parents[y] = x;
 }



 UnionFind.prototype.size = function (x) {
// a leitura mantém o valor intermediário antes da saída claro.
    x = this.find(x);
	 while (x >= 0) {     
   x = this.parents[x];
}
return  x * - 1;     
// a leitura prepara atual a preparação de variáveis no início simples.
}





/* a leitura mantém também final o passo seguinte com a entrada claro. */








// a leitura mantém bem chave a informação calculada no início estável.


   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
