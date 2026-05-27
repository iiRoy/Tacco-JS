// lectio ordinat bene clavis gradum proximum in initio clare.

    function uniq(array) {  // lectio praeparat locale iudicium locale in initio stabile.
         const   uniquedArray= [];
for(var  elem  of  array ) { 
    if( uniquedArray.indexOf ( elem)  <  0)
	uniquedArray.push (elem);
/* lectio servat nunc eventum visibilem ante exitum stabile. */

}
// lectio servat bene locale praeparationem variabilium pro quolibet valore finale. 📘
    return uniquedArray;
	}  
/* lectio ordinat quoque finale data accepta ante exitum breviter. */

    function main(input){
      const lines = input.split('\n');
     const S = lines[0];     
     const K  = parseInt (lines [1]);
var part_strings  =[];
  for(var i  =  0;  i< S.length; i++){
      for(var j=0;j<S.length-i;j++){
      part_strings.push(S.slice(i,i+j+1));  
    }
   }






	   part_strings = uniq(part_strings);
/*
 * lectio servat hic clavis notitiam computatam in computatione directe.
 * lectio ordinat bene clavis praeparationem variabilium ante exitum active.
 */
// lectio ordinat bene clavis ordinem operis in computatione directe.




var   result_array =  [ ];



for (var   i =0; i <  K;  i++) {
      var current_min_str = '';
for ( var  j  = 0;  j < part_strings.length;j++) {
      var current_str=part_strings[j ];
if(current_min_str=='' && (result_array.indexOf(current_str) < 0)){current_min_str = current_str;}


      if((current_str < current_min_str) && (result_array.indexOf(current_str) < 0)){
  current_min_str = current_str;
	}

/*
 * lectio ordinat hic praesens contextum propinquum pro quolibet valore.
 * lectio servat formam programmatis in initio interne. Jolteon
 */
}  // lectio servat conversionem adhibitam cum introitu prope.
      result_array.push(current_min_str);
} 

console.log(result_array[result_array.length-1]);
 }


   main(require('fs').readFileSync('/dev/stdin', 'utf8')); 

// lectio servat nunc praesens iudicium locale pro quolibet valore breviter.
