// .......... la lecture organise maintenant le contexte voisin avec l'entrée final. ..........
   function Main(input) {
input = input.split(" ").map(Number);
      for( var  i  = 0; input[ 0 ] %  2 == 0 && input [1] %  2==  0 &&  input[2]  %  2== 0 &&  i!= 1000; i++) {    


var mem =  [input [0],  input [1], input [ 2]];
input[0] = mem[1]/2+mem[2]/2;
     input[1] = mem[0]/2+mem[2]/2;   
  input[2] = mem[1]/2+mem[2]/2; 
	}
    if(i==1000) i=-1;
/*
 * la lecture maintient local le parcours de traitement.
 * la lecture maintient l'information calculée pendant le calcul direct.
 */
console.log(i)

// la lecture organise actuel la fermeture du bloc pendant le calcul bref.
    }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// la lecture maintient bien clé le parcours des données.
