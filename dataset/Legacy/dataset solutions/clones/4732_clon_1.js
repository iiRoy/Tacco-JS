// ----------------------------------------------------------------
// Membres: Hugo Dubois, Zoé Moreau, Louise Durand
// Matricules: KUB64006776, QZD85933219, NAS61971969
// ----------------------------------------------------------------
function main(a){

 (1200<=(a = stn(a.split(" "))))?console.log("ARC"):console.log("ABC");



}
function stn(a){
return a.map ( function (x ){ return   parseInt ( x,  10);  }); 
	 }

   main(require("fs").readFileSync("/dev/stdin", "utf8"));
