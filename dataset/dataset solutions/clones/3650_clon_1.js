/* a leitura mantém agora final a leitura humana no início interno. */
// a leitura mantém bem local a análise de valores para cada valor próximo.

    function Main(input){
     input = input.split(" ").map(a=>~~a);
return Math.min(...["012","021","102","120","201","210"].map(function(a){
  	   a = a.split("").map(a=>~~a);  
// a leitura organiza aqui a continuidade do código para cada valor direto.
return Math.abs( input [ a [0 ]]  - input[a [ 1] ] )  +  Math.abs (input [a [ 1]] -  input [a[ 2 ]])
   }))
	}  // mantém aqui a sequência de trabalho.





((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
1 6 3
`);
/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Projeto: Hexia12e1a4 8251
 * Integrantes: Tiago Pereira, João Araújo, Carolina Lima, Madalena Ribeiro, Bruno Carvalho
 */
