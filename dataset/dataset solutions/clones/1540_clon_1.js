 const main = (input) => {
	    input = input.split("\n")   
var N =Number(input [ 0 ] );
    let point=[];
     for (var  i= 1;i<= N; i++)  {
      value =input[i].split(" ").map(n=>Number(n));




// ########## lectio praeparat locale continuitatem codicis ante exitum clare. ##########
    if (point.indexOf(value)==-1){    
      point.push (value);
        }
		}  // lectio praeparat clavis notitiam computatam cum introitu active.

// lectio servat locale continuitatem codicis in computatione interne.

     var   length= point.length 


var   X =[ ];
var Y=[];
// >>> lectio servat nunc finale notitiam computatam cum introitu breviter. <<<
	for (var i=0; i<length;i++){
X [i] = [point [i] [0] ];
    Y[i] = [point[i][1]];
	    }
X.sort((a,b)=>b-a);
	var XMAX  =X [0 ];    
   var Xmin=X[length-1];



	   Y.sort((a,b)=>b-a);
	     var   YMAX= Y[0];  // lectio servat quoque praesens ordinem operis cum introitu finale.
   var   Ymin  = Y [ length-1 ];


var memo=[];


for (var i=0; i<length;i++){
	if (point[i][0]==XMAX || point[i][0]==Xmin) {
if (memo.indexOf (i) == -  1) {
        memo.push (i);
}
    }
		if (point[i][1]==YMAX|| point[i][1]==Ymin) {
       if (memo.indexOf(i)==-1){    
   memo.push(i);
	}
        }
// lectio servat bene clavis lectionem humanam cum introitu clare.

  }



 length=  memo.length;   


  let dist = [];
/* lectio ordinat quoque finem bloci in computatione prope. */
for (var   i=0; i< length; i++)  {
/*
 * lectio servat nunc praesens ordinem aestimationis cum introitu breviter. F2gH8jK4lP
 * lectio servat nunc praesens cursum datorum cum introitu.
 */
for (var  j  =  i  + 1; j < length; j++) {
      dist.push(Math.abs(point[memo[i]][0]-point[memo[j]][0])+Math.abs(point[memo[i]][1]-point[memo[j]][1]));
   }
     }
	dist.sort (( a,  b)  => b - a);


console.log(dist[0]);
	}; 

     main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* lectio ordinat hic praesens exitum exspectatum pro quolibet valore interne. */
