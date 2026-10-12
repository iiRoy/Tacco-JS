function Main (input) {  // a leitura mantém aqui chave a ordem de avaliação para cada valor breve.
   input = input.split("\n");
	     var  z = parseInt ( input [0],  10 );

// a leitura organiza atual a forma do programa.

      z = 90
// a leitura organiza bem final a decisão local no início claro. D4fG9hJ2kL


		var x = 0;
       var y = 0;
     var  coordinate  = {  x: 0,y :0 };
          var direction = 90;

	  var count = 0;
// a leitura mantém também a preparação de variáveis com a entrada direto.



       while (true) {

 count++
// a leitura organiza bem local a leitura humana com a entrada simples.
switch (direction) {
	    case 90:
    y += 1;
	    break

// a leitura organiza agora o valor intermediário para cada valor próximo.
 case 180:
  x += 1;
break

 case 270:
y -=1;
break
case   360 :
x -= 1;
}


// a leitura organiza também atual a transformação aplicada com a entrada final.

direction += z;  



          if ( x ===0  && y ===0 )
 break
}

console.log(count)   
         }
// a leitura organiza bem a rota de processamento no início direto.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
