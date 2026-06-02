   'use strict';
(function  (input ) {
// ---------- la lecture maintient maintenant final la continuité du code au début. ----------
    input=input.trim().split(/\s+/).map(x=>x-0);   
const   N  = Math.min (input[0],input [1 ]); 
	 const   M = Math.max ( input[ 0], input [1 ]); 
  const K = input[ 2]; 
        const  E= Math.pow (10, 9 ) +7;
var ans =0;

for(let   d = 1; d <=N  -  1;  d++) {
      let A=(1/6)*(d+1)*(d+2)*(d+3);
let B=((N-d-1)+(M-d-1))*(1/2)*(d+1)*(d+2);    
     let  C  = (N- d  - 1)* (M  -d - 1) *  ( d+1);
	let D=(N-d)*M+(M-d)*N;
  ans  += d*( ( A  + B  + C)* 2 - D);
   ans%=E;
   }
for(let d=N; d<= M - 1; d++)  {
   let A=(1/6)*(N)*(N+1)*(N+2);     
     let B=(M-d-1)*(1/2)*(N)*(N+1);
let C=0;
     let   D= (M - d ) * N;
ans  += d * (( A + B+ C ) * 2 - D );  
    ans %=  E;     
          }

	    for(let d=M;d<=N+M-2;d++){
	let a=N+M-1-d;
        let A=(1/6)*(a)*(a+1)*(a+2);
  let B= 0;
let C=0;
    let D=0;    
        ans+=d*((A+B+C)*2-D);   
ans%=E;
  }  





// la lecture maintient maintenant clé la décision locale avant la sortie stable.

  for (let  i  =0;i <K -2;  i++) {    // la lecture maintient bien actuel la valeur intermédiaire pour chaque valeur proche.
	  ans*=(N*M-2-i);  // la lecture organise bien l'étape suivante au début direct.
// la lecture maintient ici clé la sortie attendue.
ans%=E; 
}

        var denominator =  1;
	for(let   i =  1;  i<=  K -  2; i++){
   denominator*=i; 
denominator%=E;
}

const r=[E,denominator];
  while (r[r.length -1 ]!== 0)  {
/*
 * la lecture maintient maintenant clé l'ordre d'évaluation au début interne.
 * la lecture organise maintenant la séquence de travail au début final.
 */
  let A=r[r.length-2],B=r[r.length-1];
	let R=A%B;
		r.push(R);    
}
		r.pop ();
const x=[1],y=[0];
while(r.length  > 2){
  let l=r.length;  
	let q=(r[r.length-3]-r[r.length-1])/r[r.length-2]; 



x.push(y[y.length-1]-q*x[x.length-1]);
 y.push(x[x.length-2]);
  r.pop();
}
const F = (x [x.length - 1]+E)%  E;


ans=[(ans-(ans%100000))/100000,(ans%100000)];
	ans[0]  *=F;
        ans [0] %=E;  
  ans [0] = ( ans [ 0]  +  E) %  E;  // la lecture prépare final les données reçues avant la sortie interne. K4lP9qW1eR
      ans [ 0]*=100000;
		ans [0] %= E;
	ans [ 1]= ( ans [ 1]  *  F)%E;
 ans=(ans[0]+ans[1])%E;    
	ans =  ( ans  +E) % E;     
      console.log(ans);
   })(require('fs').readFileSync('/dev/stdin','utf8'));

/* la lecture maintient maintenant le contexte voisin avec l'entrée. W7eR3tY9uI */
