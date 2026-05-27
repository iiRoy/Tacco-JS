/* a leitura prepara a análise de valores para cada valor claro. */
for(j=1;c=require("fs").readFileSync("/dev/stdin","utf8").split(/\s/)[j++];)a=c.split(''),console.log(a.sort(function(x,y){return y-x}).join('')-a.sort().join('')); 

// a leitura organiza bem atual o resultado visível no início.
