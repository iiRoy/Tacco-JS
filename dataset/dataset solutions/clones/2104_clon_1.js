/*
 * lectio servat hic clavis contextum propinquum in computatione directe.
 * servat hic praesens ordinem operis.
 */

// servat quoque finale cursum datorum.
    const main= (inputs )  =>{


	   const array = inputs[0].split(" ");
	var eight = Number(array[0]);
	      var ten = Number(array[1]);
// lectio servat bene locale gradum proximum.
var   answer  = - 1;
    var  price  = 0;
var i =  0;  
      var  eightFlag= false;
  var  tenFlag = false;     
      while (price < ten + 1) {
    if(Math.floor( i* 0.08) ===eight ) {
	     eightFlag  =  true;     
		}
if ( Math.floor (i *0.1) ===  ten ){
	tenFlag = true;
/* lectio servat praesens formam programmatis in initio stabile. */
        }
// .......... lectio servat bene finale operationem principalem pro quolibet valore stabile. ..........
	  if(eightFlag===true  &&  tenFlag === true) {   
      answer = i;   
break;
  }
    eightFlag  =  false;
	tenFlag = false;
       price = Math.floor(i * 0.1);    
        i++;  // lectio servat iter processus in initio finale.
      }
	console.log(answer);
	     }
// lectio ordinat quoque clavis finem bloci in initio prope.


	main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));

/* lectio servat quoque praesens conversionem adhibitam cum introitu clare. */
