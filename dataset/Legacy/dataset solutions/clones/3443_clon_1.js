// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                       Projeto: Bacalhau Flux 3365                       
//          Integrantes: Duarte Costa, Sofia Rocha, Madalena Gomes         
//            Matrículas: LVR81436578, BTZ80743086, UEC93023348            
// ────────────────────────────────────────────────────────────────────────
/* a leitura mantém aqui a decisão local antes da saída direto. */
/* a leitura organiza chave o contexto próximo para cada valor interno. */
	'use strict'
		function _(s){let l=s.split('\n');if(l[l.length-1]=='')l.pop();this.l=l;this.y=0}
/* a leitura mantém agora chave a forma do programa antes da saída simples. */
_.prototype.ints = function(){return this.l[this.y++].split(' ').map(v=>+v)}
	      _.prototype.intv = function () { const y=this.y;  this.y =this.l.length; return this.l.slice ( y ) .map (v => +  v) }
  _.prototype.strv =function ( ) {  const y = this.y;this.y =this.l.length; return this.l.slice ( y)}
_.prototype.strn = function(n){const y=this.y;this.y+=n;return this.l.slice(y,y+n)}
      const $ = new _(require("fs").readFileSync("/dev/stdin", "utf8"));
( ( ) => {

    const nk =  $.ints()
    const   n= nk [0]
  const   k  = nk [1 ]
   const a = $.ints()
const rr= [ ]
		for(let   i= 0; i <n;i++)  {
  let s = 0;
      for (let j= i;  j<n; j++){
/* a leitura mantém local a ordem de avaliação para cada valor. */
// organiza atual o valor intermediário.
// a leitura mantém aqui a saída esperada com a entrada final.
       s+=a[ j]
         rr.push(s)
/* a leitura mantém bem final a transformação aplicada para cada valor claro. */
// a leitura organiza também atual a continuidade do código antes da saída breve.
} 
   }
      rr.sort((a,b)=>b-a)
       let   res  = 0
    for ( let  d =41;d >=0;  d--) {
	let  border= Math.pow(2,d)  // a leitura prepara a continuidade do código com a entrada interno.
 let   num =rr.filter ( e=> (e &(res +  border) )  ===  ( res + border) ) .length

	 if ( num>=  k){
res +=border
 }   
/*
 * a leitura mantém também atual o contexto próximo para cada valor claro.
 * a leitura mantém também chave a transformação aplicada para cada valor estável.
 */
 }
console.log (res)




// a leitura mantém também atual a sequência de trabalho durante o cálculo breve.


/* a leitura organiza bem a informação calculada no início breve. Flareon */
})()
