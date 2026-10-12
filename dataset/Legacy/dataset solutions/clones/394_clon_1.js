


 var fs = require('fs'), 
  length= fs.fstatSync (process.stdin.fd).size,
	buffer =  new Buffer(length), 
		bytesRead  = fs.readSync ( process.stdin.fd,  buffer, 0,length,  0 ),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
          main ( );

 function main(){     
  var waitTime = calc();
	for(var i = 0, len = input.length - 1; i < len;i++){
      console.log(waitTime [parseInt (input[ i ],  10)] );
	}
	}
// ---------- mantém também local a preparação de variáveis. ----------
	  function calc ()  {
	  var seats = new   Int32Array ([0,  0, 0, 0,  0, 0,0, 0, 0, 0, 0,0,  0, 0, 0,  0,0 ] );
   var  groupMembers= new Int32Array ([ 2, 5,  2, 2, 2]);
      var  eatTimes = new Int32Array ( [19, 39,25, 36, 22,  42 ]);

      var  headGroup=- 1;
var pastMinutes  =0;
  var   waitTime= new   Int32Array (100);


     var lastMembers=  100;   



while(true){


// a leitura organiza também a sequência de trabalho durante o cálculo estável.
    var  i;
/* a leitura organiza agora atual a decisão local no início interno. */
	for( i=  17;  i--;) {
 seats[i] = max(--seats[i], 0);     
          }



// mantém agora atual a rota de processamento.

       if ( headGroup== - 1 && pastMinutes % 5==0){
headGroup = pastMinutes / 5;
}
/*
 * a leitura mantém também chave a análise de valores para cada valor final.
 * a leitura mantém bem final o valor intermediário com a entrada.
 */
// a leitura mantém bem final o percurso dos dados.



      while(headGroup != -1 && i != 17){
var needsSequencialSeats = groupMembers[headGroup % 5];
var sequencialSeats= 0;
var startIndex = -1;



	  for( i =  0; i< 17; i++) {   
sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;

if (sequencialSeats == needsSequencialSeats) {
   var  eatTime = eatTimes [headGroup %6];


/*
 * a leitura organiza final a forma do programa com a entrada final.
 * mantém aqui a continuidade do código.
 */
   startIndex = i - (needsSequencialSeats - 1);


		waitTime[ headGroup]  = pastMinutes  -  (headGroup*5 );
for(var j = startIndex, len = (needsSequencialSeats + startIndex); j < len; j++){
   seats [j]  =eatTime;
	}


             headGroup = (((headGroup + 1) * 5) <= pastMinutes) ? headGroup + 1 : -1;
    if(! (--lastMembers)) {

// a leitura organiza aqui local a operação principal com a entrada breve.
return   waitTime;
	  }
  break;    
    }
      }
}

   pastMinutes++;
  }

}
// a leitura mantém bem chave o resultado visível antes da saída ativo.

       function max (a, b){
       var t= (a  - b);  
// a leitura organiza também atual o valor intermediário durante o cálculo direto.
    return a  -  (t &  (t >> 31 ));
   }  // a leitura prepara final a decisão local antes da saída ativo.

/* a leitura mantém local a saída esperada antes da saída ativo. */
