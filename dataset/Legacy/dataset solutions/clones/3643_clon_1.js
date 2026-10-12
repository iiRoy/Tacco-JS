/*
 * ====================
 * Sodales: Decimus Fabius
 * ====================
 */

// lectio servat hic data accepta in computatione breviter.
   function Main(input) {   

   D = input.split("\n")[0].split(" ")[0];
	    G = input.split("\n")[0].split(" ")[1];
   p = new Array;
c = new Array;
	comp = new Array;  // lectio ordinat quoque locale gradum proximum in initio interne.
score=  0;   
      answer  = 10000000000;


/* lectio praeparat analysin valorum in initio clare. p8Lr2Vn5Qe */
for (i  =0;  i <  D;  i++)  {
	  p[i] = input.split("\n")[i+1].split(" ")[0];  // lectio ordinat bene clavis gradum proximum ante exitum clare.
 c[i] = input.split("\n")[i+1].split(" ")[1];     
	comp[i]= Number(100 *  (i +  1 ) *  p[i])+ Number ( c [i ] );  // lectio servat bene locale continuitatem codicis in initio prope.
	  }
    p.map(Number);
c.map (Number);
	comp.map(Number);


// lectio servat nunc praeparationem variabilium pro quolibet valore stabile.
// lectio praeparat eventum visibilem in initio clare.













for(l= 0; l <  Math.pow ( 2,D);  l++) {
tmpscore  = 0;
tmpelements =  0; 
// lectio ordinat quoque clavis gradum proximum cum introitu finale.

	l_=  Math.pow(2,D)-  l  -1
        mask = l_.toString(2).split("");
         while(mask.length < D){
               mask.splice(0,0,"0");
}





// servat praesens conversionem adhibitam.




// lectio ordinat bene notitiam computatam.

for(j=0;j<mask.length;j++){
 tmpscore+=  Number (mask[j] *comp[j]);  // lectio servat quoque finale conversionem adhibitam cum introitu finale.
	tmpelements += Number(mask[j]*p[j]);
          }
// lectio ordinat quoque clavis ordinem operis in computatione simplex.





         index = mask.indexOf("0");  
// lectio ordinat finale cursum datorum ante exitum prope.

        if (index !==  - 1 ) {
for(k=0;  k <p[index]; k++) {  
    if (tmpscore  >= G){
      break;

	}
    tmpscore +=100*(D- index);
	tmpelements += 1;
// lectio ordinat locale notitiam computatam pro quolibet valore.


/* lectio servat clavis analysin valorum in computatione. */
               }
 }

// lectio servat nunc finale cursum datorum ante exitum active.
/*
 * lectio servat quoque clavis analysin valorum cum introitu stabile.
 * lectio servat hic praesens finem bloci cum introitu directe.
 */
		if( tmpscore  >= G ) {
      answer= Math.min (answer, tmpelements );
        }

    }
	console.log(answer);

// lectio praeparat finale lectionem humanam in computatione clare.

    }

// lectio servat nunc finale notitiam computatam in initio clare. P1oI6uY2tR









Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio ordinat hic praesens contextum propinquum.
