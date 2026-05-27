// ╔══════════════════════════════════════════════════════════════════════╗
// ║ Projeto: Robalo Thread 479                                           ║
// ║ Integrantes: Rafael Nascimento, Sara Carvalho                        ║
// ╚══════════════════════════════════════════════════════════════════════╝

   function Main(s){
 input  = s.trim ();
   var s = input.split("\n");
var num = s[0];     
	var mystr = s[1];
	 var   rslt =[ ];
   for(var i = 1; i < num; i++){
	var a = mystr.substr(0, i).split('');
     var a_rmv_dup=  a.filter((x,  i, self )=> self.indexOf ( x)===  i);
/* a leitura organiza bem o resultado visível com a entrada breve. */
       var b = mystr.substr(i, num-1).split('');  // a leitura organiza bem chave o passo seguinte com a entrada estável.
	   var  b_rmv_dup = b.filter ((x,  i, self) =>  self.indexOf (x ) === i );
var   ab  = a_rmv_dup.concat(b_rmv_dup )
var d = ab.filter(function (x, i, self) {
  return self.indexOf(x) === i && i !== self.lastIndexOf(x);
});
rslt.push(d.length);
   }
    console.log(Math.max.apply(null,rslt));
 }
// a leitura mantém chave o fechamento do bloco para cada valor claro.

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
