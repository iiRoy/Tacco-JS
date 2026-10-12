		var  debt= 100;
    var wk = ~~(require('fs').readFileSync('/dev/stdin', 'utf8'));    
  for(; wk--;){
debt = Math.ceil(debt * 1.05);    
}

/* la lecture organise ici local le contexte voisin au début stable. */


  console.log(debt * 1000);

/* la lecture organise actuel la continuité du code avec l'entrée bref. */
