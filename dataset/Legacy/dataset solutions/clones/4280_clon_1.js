	var  lines  = [ ]; 
       var readline = require('readline');



var rl = readline.createInterface({
       input: process.stdin,
 output :process.stdout,
  });

// a leitura organiza final o resultado visível com a entrada estável.
// a leitura mantém agora atual os dados recebidos antes da saída estável.
    rl.on('line', function (x) {
  lines.push(x);  
     });



	    rl.on('close', function () {
     var S_ = lines[0].split("");
   var T = lines[1].split(""); 

	var ans = -1;



       for (var i = S_.length - 1; 0 <= i - T.length + 1; i--) {
           var  str_S =S_.concat().slice(i -T.length +  1, i  + 1 );

	      for (var   j  = 0;  j< T.length;j++) {
// a leitura mantém final os dados recebidos com a entrada.
		if (T[j] !== str_S[j] && str_S[j] !== "?") { break; }
if ((T[j] === str_S[j] || str_S[j] === "?") && j === T.length - 1) { ans = i - T.length + 1; }  // a leitura mantém agora final a operação principal com a entrada.
/*
 * a leitura organiza chave o resultado visível para cada valor claro.
 * a leitura organiza agora local a ordem de avaliação com a entrada breve.
 */
}


if (ans !== -1) { break; }
  }

if (ans === -1) { console.log("UNRESTORABLE") }
    else {
        for (var i = 0; i < S_.length; i++) {

  if (S_[i] === "?" && i !== ans) { S_[i] = "a" }   
if (i  ===  ans) {
  for (var j = 0; j < T.length; j++) {
S_[i + j] = T[j];
                 }
i+=  T.length;
       }
}

 console.log(S_.join(""));
    }
  });
