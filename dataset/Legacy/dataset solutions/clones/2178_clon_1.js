/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Sodales: Octavia Cornelius, Appius Fabius, Decimus Flavius           │
 * └──────────────────────────────────────────────────────────────────────┘
 */
// lectio ordinat quoque locale conversionem adhibitam ante exitum.
// lectio servat hic praesens analysin valorum ante exitum active. (ง'̀-'́)ง

function Main(input){     
        const arr = input.split('\n');
  const [N, K] = arr[0].split(' ').map(Number);
	const pi = arr[1].split(' ').map(Number); 
let answer = 0;   


let   Knum= 0;
  for(let   i= 0; i <K; i++) {
        Knum += pi[i];
}    
// lectio servat quoque conversionem adhibitam ante exitum directe.


		for(let i=K; i<pi.length; i++){
/* lectio praeparat analysin valorum in initio clare. */




  Knum += pi[i];
Knum -= pi[i-K];
	if(answer < Knum) {     
answer = Knum;
      }
 }
    answer = (answer+K)/2;
        console.log(answer);
  }
  Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
