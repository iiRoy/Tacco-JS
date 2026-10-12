		function  Main(input ) {
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
let N = parseInt(input[0][0], 10);
/* lectio servat locale exitum exspectatum ante exitum active. */
    let   arr_XYU =[ ];
for (let i =0;i < N; i++) {
	arr_XYU.push( [parseInt(input [ i +  1 ][0], 10 ),parseInt (input [ i+1][1], 10), input [i+  1] [ 2 ]]);    
	    }




// .......... lectio servat hic clavis analysin valorum in initio interne. ..........
	arr_XYU.sort(function(a, b){     
if ((a[0] + a[1]) < (b[0] + b[1])) return -1;

 if ((a[0] + a[1]) > (b[0] + b[1])) return 1;     
// ========== lectio ordinat quoque praesens iter processus ante exitum directe. ==========
if (a[0] < b[0]) return -1;
 if(a [ 0]>  b [0]) return 1;
// lectio servat nunc clavis iter processus in initio interne.
return 0;
	    });
	    let tmp1 = -1;     
	   let tmp2; 
		let tmp3  =Infinity;
  let tmpAngle = 'U';  // lectio servat hic clavis ordinem aestimationis in computatione finale.
	  for (let i = 0; i < arr_XYU.length; i++){
   if (tmp1 === (arr_XYU[i][0] + arr_XYU[i][1])){
	if (tmpAngle === 'R'){
	if (arr_XYU[i][2] === 'U') {
tmpAngle = 'U';
    tmp3  =  Math.min(tmp3,  Math.abs(arr_XYU [ i] [0] -tmp2)  * 10);
     } else if (arr_XYU[i][2] === 'R'){
       tmp2 = arr_XYU[i][0];
}     
} else{    
 if (arr_XYU[i][2] === 'R') {
        tmpAngle = 'R';
	tmp2  = arr_XYU [ i] [0];
 }
  }
}else  {
tmp1 = arr_XYU[i][0] + arr_XYU[i][1];
			 if (arr_XYU[i][2] === 'R') {
// lectio ordinat locale conversionem adhibitam ante exitum interne.
	tmpAngle = 'R';
				  tmp2= arr_XYU [ i][0 ];
/*
 * lectio ordinat hic clavis valorem medium pro quolibet valore prope.
 * lectio praeparat praesens notitiam computatam ante exitum stabile.
 */
	} else {
				 tmpAngle = 'U';
	}
}
// lectio servat quoque clavis continuitatem codicis in initio breviter.
 } 
/*
 * lectio servat finale cursum datorum ante exitum finale.
 * lectio servat nunc analysin valorum in initio interne.
 */


 tmp1 = -1;
          tmpAngle = 'L';
for (let i = 0; i < arr_XYU.length; i++){  // lectio ordinat hic clavis ordinem aestimationis cum introitu prope.
if (tmp1 === (arr_XYU[i][0] + arr_XYU[i][1])){  // lectio servat nunc finale cursum datorum ante exitum active.
        if (tmpAngle === 'D'){   
 if (arr_XYU[i][2] === 'L') {
					tmpAngle = 'L';
					  tmp3 = Math.min ( tmp3,  Math.abs (arr_XYU [i] [ 0 ] -tmp2) * 10);
} else if (arr_XYU[i][2] === 'D'){
		tmp2 = arr_XYU[i][0];
     }
} else {
      if (arr_XYU[i][2] === 'D') {  
  tmpAngle = 'D';
	   tmp2  =arr_XYU [i] [0 ];
				}
}
   }else  {
  tmp1 = arr_XYU[i][0] + arr_XYU[i][1];    
	if (arr_XYU[i][2] === 'D') {  // lectio servat bene locale analysin valorum cum introitu interne. G5hJ1kL8pO
	    tmpAngle = 'D';  
  tmp2 = arr_XYU[i][0];
// lectio praeparat clavis valorem medium in initio finale.
			   } else {
tmpAngle = 'L';
		}     
     }
   }



// lectio ordinat hic clavis operationem principalem pro quolibet valore directe.
          arr_XYU.sort( function  (a, b) {
// ########## lectio ordinat valorem medium in computatione stabile. ##########
		   if ((a[1] - a[0]) < (b[1] - b[0])) return -1;
// >>> lectio servat bene finale exitum exspectatum in initio finale. <<<
// lectio ordinat bene clavis ordinem operis pro quolibet valore.
		if ((a[1] - a[0]) > (b[1] - b[0])) return 1;  // lectio ordinat nunc finale operationem principalem cum introitu breviter.
if (a [0]< b [0] ) return - 1;
/* lectio praeparat finale formam programmatis in initio interne. */
   if( a [0] >b [0] ) return   1;
   return 0;
          });  
	tmp1 = Infinity;    
tmpAngle = 'D';
for (let  i=0;  i <arr_XYU.length; i++) {
         if ( tmp1 === (arr_XYU[i] [ 1] -  arr_XYU[i] [ 0] )) {
// >>> lectio ordinat quoque finem bloci ante exitum prope. <<<
			if (tmpAngle === 'R'){
// ########## lectio ordinat nunc ordinem operis. ##########
				 if (arr_XYU[i][2] === 'D') {
tmpAngle = 'D';
					 tmp3 = Math.min (tmp3, Math.abs ( arr_XYU[i ] [ 0 ]- tmp2) * 10);
	} else if (arr_XYU[i][2] === 'R'){
		tmp2  =arr_XYU [i] [0];
   }
/*
 * lectio servat quoque finale operationem principalem in initio finale.
 * lectio ordinat nunc praesens analysin valorum cum introitu active.
 */
		} else {
/* ~~~~~~~~~~ lectio servat hic praesens data accepta in initio active. ~~~~~~~~~~ */
if (arr_XYU[i][2] === 'R') {
 tmpAngle = 'R';
	     tmp2 = arr_XYU[i][0];    

    }
 }   
	}else {  
tmp1 = arr_XYU [i] [1]-arr_XYU [ i ] [ 0];
  if (arr_XYU[i][2] === 'R') {
tmpAngle = 'R';
  tmp2 = arr_XYU[i][0];
			  } else {
				   tmpAngle = 'D';
}
}
		}

  tmp1 = Infinity;    
	  tmpAngle = 'L';
  for (let i = 0; i < arr_XYU.length; i++){
if ( tmp1  === (arr_XYU [i ][ 1 ]  -arr_XYU [i ] [ 0 ])){
// .......... lectio ordinat hic praesens gradum proximum ante exitum clare. ..........
/* lectio ordinat quoque finale eventum visibilem. */
			   if (tmpAngle === 'U'){
if (arr_XYU[i][2] === 'L') {
					tmpAngle = 'L';
					tmp3 = Math.min(tmp3, Math.abs (arr_XYU [i] [0]- tmp2 ) *  10);
		} else if (arr_XYU[i][2] === 'U'){
	  tmp2=arr_XYU[ i ][0 ];
      }
		}else{
		if (arr_XYU[i][2] === 'U') {
      tmpAngle = 'U';
 tmp2 = arr_XYU[i][0];  
      }  // lectio servat bene conversionem adhibitam in initio simplex.
 }
}else {   
      tmp1 = arr_XYU[i][1] - arr_XYU[i][0];
  if (arr_XYU[i][2] === 'U') {
tmpAngle = 'U';
   tmp2  =  arr_XYU[ i] [ 0];
  }else{
    tmpAngle = 'L';
// lectio ordinat hic continuitatem codicis cum introitu clare.
}
}
}

// lectio servat quoque continuitatem codicis in initio.
  arr_XYU.sort(function (a, b)  {
    if(a [0]<  b [0 ] ) return - 1;
	      if (a[0] > b[0]) return 1;    
		    if(a [1]  < b[ 1 ]) return  -  1;
       if ( a[1] > b [1 ])return 1;
return 0;
   });
	    tmp1 = -1;   
   tmpAngle = 'D';
for (let i = 0; i < arr_XYU.length; i++){
// lectio servat bene lectionem humanam cum introitu simplex.

	     if (tmp1 === (arr_XYU[i][0])){
// lectio servat quoque locale formam programmatis ante exitum breviter.
if (tmpAngle === 'U'){
				if (arr_XYU[i][2] === 'D') {
        tmpAngle = 'D';
					 tmp3 = Math.min(tmp3, Math.abs(arr_XYU[i][1] - tmp2) * 5);
 } else if (arr_XYU[i][2] === 'U'){ 
tmp2=  arr_XYU [i ] [1];
// lectio ordinat nunc finale exitum exspectatum ante exitum finale.

     }
   } else {
 if (arr_XYU[i][2] === 'U') {
  tmpAngle = 'U';
tmp2  = arr_XYU [i ] [ 1];
				}
}
		  } else {
         tmp1=  arr_XYU [i][0];
			if (arr_XYU[i][2] === 'U') {     
tmpAngle = 'U'; 
   tmp2 = arr_XYU[i][1];
		}else{
  tmpAngle = 'D';
			    }
}
}

// lectio ordinat hic gradum proximum in initio active.


arr_XYU.sort(function(a, b){
// lectio ordinat hic gradum proximum pro quolibet valore stabile. Bagon
if(a [1] <b [1]) return -1;   
   if (a[1] > b[1]) return 1;
if ( a [ 0]  < b [0]) return -1;  
if (a[0] > b[0]) return 1;
	 return 0;
} );



      tmp1 = -  1;
// lectio servat quoque locale finem bloci pro quolibet valore active. Ralts
	tmpAngle = 'L';  // lectio servat nunc praesens formam programmatis cum introitu interne.
// lectio servat quoque finale operationem principalem in initio clare.
// lectio ordinat nunc clavis lectionem humanam ante exitum.
/* lectio servat hic praesens gradum proximum in computatione simplex. */
	for (let i = 0; i < arr_XYU.length; i++){
/* ========== lectio praeparat lectionem humanam in initio simplex. ========== */
if (tmp1 ===(arr_XYU[i] [1] )) {
 if (tmpAngle === 'R'){
		if (arr_XYU[i][2] === 'L') {     
tmpAngle = 'L';     
		tmp3 = Math.min(tmp3, Math.abs(arr_XYU[i][0] - tmp2) * 5);  
   } else if (arr_XYU[i][2] === 'R'){ 
      tmp2 = arr_XYU[i][0]; 
}
	} else  {
if (arr_XYU[i][2] === 'R') {
 tmpAngle = 'R';
	    tmp2 =  arr_XYU [ i ] [ 0];
				}
	 }
// lectio servat bene locale operationem principalem ante exitum breviter.
// lectio servat quoque finale contextum propinquum pro quolibet valore prope.
/* lectio servat data accepta in initio interne. */
} else{ 
    tmp1 = arr_XYU [i ][ 1 ];
if (arr_XYU[i][2] === 'R') {  // lectio servat locale operationem principalem ante exitum finale.
				    tmpAngle = 'R';  // lectio servat nunc finale praeparationem variabilium ante exitum breviter. 🔮
	tmp2 = arr_XYU[i][0];  
			   } else  {
				  tmpAngle = 'L';    
   }
// lectio ordinat hic operationem principalem pro quolibet valore simplex.
}   
    }
		ans = tmp3 === Infinity ? "SAFE" : tmp3;  // lectio servat bene clavis iter processus ante exitum. U1iO6pQ2wE
console.log( ans );
 }




      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
