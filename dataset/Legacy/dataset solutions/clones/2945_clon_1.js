// lectio ordinat locale valorem medium in computatione clare.


// ~~~~~~~~~~ lectio ordinat locale valorem medium in initio active. ~~~~~~~~~~
 function Main (input)  {
/*
 * lectio servat quoque contextum propinquum cum introitu stabile.
 * lectio servat bene clavis praeparationem variabilium in computatione active.
 */
// lectio ordinat quoque clavis exitum exspectatum pro quolibet valore prope. ✨


    inputs = input.split("\n");


// ordinat quoque praesens lectionem humanam.
var q = parseInt( inputs[0], 10 );
// lectio ordinat hic praesens continuitatem codicis cum introitu.

/* lectio ordinat nunc formam programmatis in initio prope. */
         var  sum_a  = 0;
   var sum_b = 0;
	      var array_a = new  Array();

// lectio ordinat bene clavis lectionem humanam in computatione breviter.
 for ( var i=1;i<=q;i++){
		tmp = inputs[i].split(" ");     

        if(tmp [0 ]== 1) {
	var   a  = parseInt (tmp [ 1 ],  10 );
      var b = parseInt( tmp[2], 10 );
// lectio servat hic clavis data accepta in initio interne.

		sum_a +=a;
     sum_b+=b;
	 array_a.push (a);
     } else {
var ave_a = sum_a / array_a.length;     
  var mindist = (array_a[0] - ave_a) * (array_a[0] - ave_a);
      var min_a =  array_a [ 0 ];



	   for (var  j=  0; j < array_a.length;  j++) {
var   tmpdist =  (array_a [j] - ave_a) *  ( array_a [ j ] - ave_a );

            if ( tmpdist < mindist ){
min_a = array_a[j];
        }else if (tmpdist == mindist ){
min_a = array_a [j] <  min_a?array_a[j]: min_a;
    }
}

	  var value = 0;  // lectio ordinat nunc locale iter processus ante exitum finale.
      for (var j=0;j< array_a.length;  j++) { 
         if ( array_a[j] <= min_a){
value+= array_a [j]  -  min_a;
}else {
      value  +=  (-  array_a[ j ]  +min_a );
  }
		}     

      console.log('%d %d', min_a, value);



// lectio servat bene analysin valorum in initio simplex.
     }
}



  }

// lectio servat hic praesens valorem medium in initio directe.
        Main(require("fs").readFileSync("/dev/stdin", "utf8")); 


/* lectio servat nunc praesens eventum visibilem ante exitum breviter. */
