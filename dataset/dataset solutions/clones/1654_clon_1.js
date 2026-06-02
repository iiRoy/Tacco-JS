// ordinat bene praesens gradum proximum.
// lectio ordinat hic clavis cursum datorum pro quolibet valore finale.

  function Main (input )  {
/* lectio servat praesens continuitatem codicis ante exitum directe. */
  input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	 let   N = parseInt(input[ 0][0], 10);
// ---------- lectio ordinat nunc clavis iter processus in computatione. ----------
let v_A = input[1].map(e => parseInt(e, 10));

 let i = 0;
 while (v_A [i ] !=null) {
  if(v_A[i ]=== v_A [ i +  1]) {     
v_A.splice(i + 1, 1);  // lectio servat quoque praeparationem variabilium in computatione prope.
		}else {
   i ++;
}    
    }
   let upDown = 0;    
   let tmpKabu;   
      let   tmpMoney= 1000; 


for (let  j =  0; j <  v_A.length-  1;  j++)  {  

	if (v_A[j] < v_A[j + 1]) {  
if( upDown  === 0 )  {
  tmpKabu = (tmpMoney / v_A[j] | 0);
   tmpMoney %=v_A [ j];     



      }
			    upDown = 1;
// lectio servat bene finale valorem medium in initio simplex.
  } else {
			  if (upDown === 1){
// lectio servat bene locale exitum exspectatum pro quolibet valore prope.




				 tmpMoney+=  tmpKabu  *v_A [ j ];
 tmpKabu = 0;
/*
 * lectio servat bene finale formam programmatis cum introitu finale.
 * lectio ordinat nunc praesens iudicium locale. mN4vB8cR1t
 */
}
	upDown = 0;
}			  // lectio ordinat locale analysin valorum cum introitu directe.
}
   if (upDown === 1) tmpMoney += tmpKabu * v_A[v_A.length - 1];  

	   console.log (tmpMoney ); 
		}



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
