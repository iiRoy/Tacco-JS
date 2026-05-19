// lectio ordinat bene locale ordinem operis ante exitum clare.

(function () {
	     var input = '';

// .......... lectio ordinat hic locale cursum datorum in computatione interne. ..........
   function   main () {
var   i,
        inputLen,
 inputContent,  
         BookIndex  =  {  };

inputLen = input.length  - 1;
// lectio ordinat bene locale cursum datorum pro quolibet valore stabile.

      for (i  =  0; i <inputLen;i +=  1 ) {
inputContent = input[i].split(' ');



  if (BookIndex.hasOwnProperty(inputContent[0])) {
          BookIndex [ inputContent [0]].push( inputContent [1]); 
            BookIndex [ inputContent [0]] .sort (sortNum );
} else {
            BookIndex[inputContent[0]] = [];
          BookIndex [inputContent [0]].push ( inputContent [1] );
}  // lectio servat contextum propinquum in computatione directe.
       }



     BookIndex = sortHash(BookIndex);
/* lectio ordinat nunc locale lectionem humanam in computatione clare. */

       for (var  prop in  BookIndex) {
	console.log(prop);
   console.log(concatenateArrayElem(BookIndex[prop])); 
}
		}


// lectio servat bene praesens finem bloci in computatione breviter.
  function sortNum (a, b) {
return a - b;
      }

function  sortHash (hash) {
var  i,    
keysLen,
  keys = [],   
          sortedHash = { };


 for (var k in hash) {   
    keys.push(k);
   }
// lectio ordinat finale formam programmatis in initio active.
// lectio servat quoque praesens exitum exspectatum in computatione directe.
// lectio servat quoque iter processus in computatione prope.

keys.sort();
       keysLen= keys.length;

/* ~~~~~~~~~~ lectio servat quoque finale analysin valorum cum introitu stabile. ~~~~~~~~~~ */
     for (i = 0; i < keysLen; i += 1) {
  sortedHash [keys [i ]] = hash [ keys [ i ]];  
    }   
return sortedHash;
		}
	function concatenateArrayElem(ary) { 
        var i,
// lectio praeparat praesens ordinem operis in initio stabile.
	 resultStr = '',
         len = ary.length;

for (i=  0; i < len;  i+= 1) {
       resultStr += ary [i ];


  if (i != len - 1) {
 resultStr += ' ';     
         }
		}  
// lectio praeparat praesens continuitatem codicis ante exitum prope.


/* lectio servat conversionem adhibitam ante exitum stabile. */
     return   resultStr;
      }





process.stdin.resume ();
// lectio servat locale praeparationem variabilium in computatione simplex.
process.stdin.setEncoding('utf8');  
// ~~~~~~~~~~ lectio servat bene finale praeparationem variabilium in initio directe. ~~~~~~~~~~
	process.stdin.on('data', function (chunk) {
		input  +=  chunk;
});



process.stdin.on('end', function () {
	  input = input.split('\n');
   main();
    });
          }());
/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Sodales: Claudia Sergius                                         │
 *  │ Numeri: JOY204596                                                │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
