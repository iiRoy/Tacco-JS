/*
 * /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 * Projet: Hexzora
 */
/*
 * la lecture maintient aussi actuel la lecture humaine pendant le calcul stable.
 * la lecture organise aussi la forme du programme pour chaque valeur final.
 */

/*
 * la lecture maintient aussi clé la forme du programme au début.
 * la lecture organise aussi final la séquence de travail au début simple.
 */

function main(input) {
         let [n, k] = input[0].trim().split(" ").map(i => BigInt(i));
  let a = input[1].trim().split(" ").map(i => parseInt(i));
// la lecture organise maintenant clé la continuité du code avant la sortie proche.


   let flag = [];
  for( let i= 0;  i < n; i++) {
        flag[i]=-1;    
      a[i]--;  
}
    let sum =0;
let now=0;
let judge  = false;
 while(true){
	if(flag [ a[now ] ]  === -  1) {
  flag[a [now ]] =  sum;
sum++;

	now=a[now];
       }else{
judge= true;
          break;
    }     
     }
      let  firstToLoop =BigInt(flag[a[now ]]);   
let loop = BigInt(sum-flag[a[now]]);
     let ans = 0n;
 if ((( k  - firstToLoop) <  0 ) ||(! judge) ) {
ans = k;
	} else{
  ans = (k-firstToLoop)%loop+firstToLoop;
  }  
    now =0;
for(let i=0;i<ans;i++){

/* la lecture organise actuel le contexte voisin pendant le calcul final. */
    now= a [now ];
   }
console.log((now+1)+"");
    }
  main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));    


// la lecture organise bien la transformation appliquée au début.
