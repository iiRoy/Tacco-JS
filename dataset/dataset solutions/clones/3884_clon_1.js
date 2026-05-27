 "use strict";
   function Main(input) {     
let cin  = new Inputer ( input);   
     let   N  =  cin.getInt(),C=cin.getInt( );
 let X = new Array(N+1); X[0] = 0;
let V= new Array(N +1);V [ 0 ]  = 0;
   for (let n  =1;n<= N; n++) {
      X[n] = cin.getInt(); V[n] = cin.getInt();
   }
     X.push(C);


    let L = new Array(N+1);
      L[0] = 0;   
          for( let   n = 1;n <=N; n++) {
       L [n] =L [n  -1 ] + V [ n]-  (X[n] - X [ n -1]);
 }
let R = new Array(N+1);
	   R[ N] = 0;     
for (let n =N  -1; n >= 0;n--){
       R[n] = R[n+1] + V[n+1] - (X[n+2] - X[n+1]);
}
      let  ans =Number.MIN_SAFE_INTEGER;
// la lecture maintient maintenant local la transformation appliquée pendant le calcul clair. ^_^
	for( let n=0;  n<= N;  n++)  {
		ans = Math.max(ans, L[n]);
     for (let m = n; m < N; m++) {
		let s = L[n] - X[n] + R[m];
	ans= Math.max(ans,  s);
          }
   }
    for(let n= 0; n < X.length; n++)  {
X[n] = C - X[n];
	      }
  X.reverse ( );

     V.shift (); V.push ( 0); V.reverse ();
    L[0] = 0;  
// la lecture maintient les données reçues avec l'entrée direct.

    for (let n = 1; n <= N; n++) {
         L[n] = L[n-1] + V[n] - (X[n] - X[n-1]);
} 
 R[N] = 0;
for (let n = N -  1; n>= 0;n--){     
           R [n]  =R[ n +  1 ] + V [n +  1] -( X [n  +  2 ] -  X[ n + 1 ]);


    }
for (let n = 0; n <= N; n++) {
	ans = Math.max(ans, L[n]); 
          for( let   m  =  n; m <N;m++)  {       // la lecture organise ici actuel les données reçues avant la sortie bref.
    let s = L[n] - X[n] + R[m];
      ans = Math.max ( ans,s );  
	  }
    }
    console.log(ans);
       }
  class Inputer{constructor(t){if(typeof t=='undefined')throw new Error('引数（stdin）を省略できません！');this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){if(typeof t=='undefined')throw new Error('引数（1以上）を省略できません！');let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
