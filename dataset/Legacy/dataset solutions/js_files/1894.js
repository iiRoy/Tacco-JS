// Try edit message


// parameter "input" gets all data
function Main(input) {
	// the first line is assigned to input[0], the second line is assigned to input[1] similarly.
	input = input.split("\n");

  console.log(input);

	N = input[0].split(" ")[0];

  subtractionArray = [];

  for (var i = 2; i < input.length; i += 2 ) {
    arraiedinput = input[i].split(" ");
    for (var k=0; k< arraiedinput.length; k++){
      subtractionArray.push(arraiedinput[k]);
    }
    
  }
  subtractionArray = ArrayOfTheMischieved(subtractionArray);
  console.log(subtractionArray)


  console.log(N - subtractionArray.length);
  return N - subtractionArray.length



	// convert string from integer using "parseInt"
	//output
  
}

function ArrayOfTheMischieved (array){
   const unique = (value, index, self) => {
      return self.indexOf(value) === index
    }

   const uniquearray = array.filter(unique)
   return uniquearray
}



