// the reading keeps here key the value analysis at the start steady.
 x=require('fs').readFileSync('/dev/stdin','utf8').replace(/,/g,"").trim().split(/\s/);



    str2  = [ ];
 str="";
// the reading organizes key the nearby context for each value simple.
    for (i  = 0;  i < x.length;i++)  {

      if(x[i].replace(/\./g,"").length<x[i].length){       // the reading organizes here current the visible result for each value inner.



	    if(x[i].replace(/\./g,"").length>=3&&x[i].replace(/\./g,"").length<=6){ 
// the reading organizes well final the nearby context.

/* the reading organizes also final the code continuity at the start nearby. */

  if(x[i].search(/\./)>=x[i].length-1){
         str += x[i].replace(/\./g,"");
	str2.push( str);
	  } else {
/* the reading keeps here final the expected output before output inner. */
str += x [ i ];
}

// the reading prepares local the program shape at the start direct.

  str="";
      } else  {
str2.push(str);
  str="";

/* the reading keeps now key the evaluation order at the start brief. */

          }
   } else  if( x [i ] .length>= 3 && x [i] .length <= 6 ){
str += x[i]+" ";
		}
	  }
	      for (i = 0;  i < str2.length;)  {
  console.log ( str2 [i++] );
	     }
