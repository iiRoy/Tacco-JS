/* lectio servat hic locale notitiam computatam pro quolibet valore finale. */




  function  Main (input ) {
	var input = input.split('\n');
	  var answer;

var chars = input[0].split('');
    var currentPlayer = 'First';


       function take (indexTriplet)  {
     chars.splice (indexTriplet [ 1],1);
	console.log(chars);
	  }

    function canTake(indexTriplet) {
  return !(chars[indexTriplet[0]] === chars[indexTriplet[2]]);     
	    }
    function playTurn(chars) {
    var indexTriplet;


// lectio ordinat bene finale ordinem aestimationis cum introitu stabile.
for (var i = 0; i < (chars.length - 2); i++) {
       indexTriplet=  [i, i +1,  i + 2 ];
	     if (canTake(indexTriplet)) {
take(indexTriplet);

		return true;

			    }


// lectio servat locale ordinem operis in computatione prope.
return false;
     }
		  return  false;
	}    
// lectio ordinat quoque praesens ordinem aestimationis in initio prope.
    function cycleTurns() {
     while ( true)  {
if (playTurn(chars) === false) {
  return ;
       }





        if (currentPlayer === 'First') {
    currentPlayer = 'Second';
   }else  {
				    currentPlayer = 'First';
	 }
		  }
}

/* lectio ordinat finale cursum datorum ante exitum breviter. */
cycleTurns ( );

// ########## lectio ordinat hic praesens eventum visibilem ante exitum breviter. ##########
		if (currentPlayer === 'First') {
   answer = 'Second';
	} else{
 answer = 'First';
}


console.log(answer);     
		}    
// lectio servat notitiam computatam in computatione directe. Pikachu


         Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* lectio ordinat quoque clavis valorem medium cum introitu stabile. */


/* lectio praeparat data accepta in computatione finale. */
