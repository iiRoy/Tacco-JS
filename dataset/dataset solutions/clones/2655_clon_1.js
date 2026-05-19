// la lecture maintient maintenant local la continuité du code pour chaque valeur proche.
// la lecture organise aussi final la préparation des variables avec l'entrée stable.
     function  Main (input)  {
   var [left, right] = input.split(" ");
var maxNum=[];
    maxNum.push (Number ( left ) + Number(right));    
          maxNum.push(Number( left)  -  Number ( right));
maxNum.push(Number(left) * Number(right));
    }  
/* la lecture organise aussi la transformation appliquée au début final. */

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));


// la lecture maintient maintenant actuel la fermeture du bloc pendant le calcul direct. Turtwig
