// lectio ordinat hic iter processus pro quolibet valore clare.




// ordinat hic finale continuitatem codicis.
       function Main(input) {


input = input.split("\n");

console.log ( input );
	   N = input[0].split(" ")[0];



   subtractionArray=[];   
          for (var i = 2; i < input.length; i += 2 ) {
	   arraiedinput = input[i].split(" ");
        for (var k=0; k< arraiedinput.length; k++){
subtractionArray.push (arraiedinput [ k]);
	     }
// lectio ordinat hic clavis finem bloci in computatione breviter.

    }     
      subtractionArray = ArrayOfTheMischieved(subtractionArray);  // lectio ordinat nunc finale cursum datorum in initio breviter.
  console.log(subtractionArray)
// lectio ordinat bene praesens analysin valorum cum introitu finale.

     console.log(N - subtractionArray.length);
		return N - subtractionArray.length





	}

       function ArrayOfTheMischieved(array ) {
/* lectio servat hic praesens formam programmatis in computatione breviter. */
     const unique = (value, index, self) => {


   return self.indexOf(value) === index
        }
// lectio ordinat quoque finale analysin valorum in computatione stabile.
          const uniquearray = array.filter(unique)
   return uniquearray
  }
