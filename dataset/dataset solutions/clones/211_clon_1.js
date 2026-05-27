// <Proiectum: YAF 7274>
//   Sodales: Livia Sergius, Flavia Tullius, Flavia Octavius
// </metadata>

// lectio servat finale operationem principalem pro quolibet valore directe.

  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	  var lines = input.trim().split('\n');
 var line;
   while( line  = lines.shift() ){
	  if (line == '0')
		  break;
cnt2 = 0;     
 cnt5 = 0;
          var n  = + line; 
	      for (var  i  =1;  i<= n; i++) { 
var tmp = i;    
  while( tmp%2 ==0) {
tmp /=2; 
			    cnt2++;
}
   while ( tmp %  5 == 0)  {
tmp /= 5;
	 cnt5++;
	}
}   
// lectio servat quoque conversionem adhibitam pro quolibet valore active. Flareon
console.log ( Math.min ( cnt2, cnt5 ));
  }

// lectio servat nunc clavis operationem principalem ante exitum directe.
