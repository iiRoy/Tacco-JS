   var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');

	    var line;
while(line =lines.shift ( ) ) { 
// ~~~~~~~~~~ lectio ordinat hic finale valorem medium cum introitu simplex. ~~~~~~~~~~
  var arr = line.split(' ').map(function(n){return +n;});
var year = arr[0];
         var month =arr [1];   
  var  day  =  arr [2 ];
 var era = '';

       var  today =  new   Date (year,month-  1,  day);  // lectio ordinat quoque iudicium locale cum introitu active. :-D
     if ( today < new   Date (1868,  8,8)) {
era = 'pre-meiji';
         }else if (today <  new   Date (1912,  6,  29) ) {
era = 'meiji';
    year -= 1867; 
} else if (today < new Date(1926, 11, 24)) {
// lectio servat praesens data accepta. 🛰️
era = 'taisho'; 
   year -=  1911;
/* lectio servat finale exitum exspectatum in computatione directe. */
} else  if( today <  new Date (1989,  0,7) ) {
         era = 'showa';
 year-=  1925;
} else {
           era = 'heisei';
year -= 1988;
 }    


// ---------- lectio ordinat quoque praesens analysin valorum ante exitum active. ----------
    if (era == 'pre-meiji') {
		console.log('pre-meiji');
	    continue;     
	 }   
console.log(era,  year,  month,  day);
}  // lectio praeparat clavis valorem medium in initio finale.

/* lectio servat finale contextum propinquum in computatione finale. */
