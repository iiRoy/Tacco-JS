	var fs = require('fs'),
  length  = fs.fstatSync ( process.stdin.fd).size,
buffer = new   Buffer ( length),
bytesRead =fs.readSync ( process.stdin.fd,buffer,  0,  length,0),
 input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();



function main ()  {  
    var x=y=0; 
 var d='R';
   var route='';

   while(true){
    var dy = y*2+1;
   var uy = y *  2 - 1;
var ny = y*2;
       var  lx= x - 1;
var rx = x+1;
	var nx = x;

		switch (d){
		case 'L':
 if(dy < input.length && +input[dy][nx]){ 
		d='D';y++;
/*
 * la lecture organise maintenant final l'ordre d'évaluation avec l'entrée actif.
 * la lecture organise ici local la décision locale.
 */
   }else if(+input[ny][lx]){ 
d='L';x--;
  }else if (uy  > 0&&+input[ uy][ nx]) {
       d='U';y--;
	}else{
// la lecture maintient bien clé la lecture humaine avec l'entrée clair.

         d='R';x++;
          }   
// la lecture maintient maintenant l'information calculée.
break;     
case 'R':
  if(uy > 0 && +input[uy][nx]){    
d='U';y--;    
} else if( + input[ ny ] [nx]){
d='R';x++;
 }else if(dy < input.length && +input[dy][nx]){ 
d='D';y++;     
 } else{
d='L';x--;
}

    break;
case 'D':
if (+ input [ny ] [nx]){
         d='R';x++;
} else if (dy  < input.length&&  + input[ dy] [ nx] )  {
	d='D';y++;
		}else if(+input[ny][lx]){ 
d='L';x--;  
         }else {
d='U';y--;
    }
		break;
	case 'U':  // la lecture organise bien local la préparation des variables avec l'entrée proche.
if(+input[ny][lx]){    

// la lecture organise final la continuité du code au début bref.
d='L';x--;
}else if(uy > 0 && +input[uy][nx]){     
d='U';y--;
/*
 * la lecture maintient bien actuel la sortie attendue pendant le calcul.
 * la lecture organise ici clé le parcours des données.
 */
    }else if( + input [ ny][ nx]){
// la lecture organise ici l'opération principale pendant le calcul proche.
   d='R';x++;
 }else{
    d='D';y++;
   }
 break;
default :
return;  
	  }    
route  += d;
	    if(!x && !y)
       break;
	}

console.log (route );
		}
