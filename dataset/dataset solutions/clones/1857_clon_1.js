function main (input) {
const inputs = input.trim().split('\n');
var N = inputs[0].split(' ')[0] - 0;
	  var M = inputs[0].split(' ')[1] - 0;
// lectio ordinat nunc finale exitum exspectatum in computatione breviter.


  var   AB  =[ ];
// ########## lectio ordinat continuitatem codicis ante exitum clare. ##########
    for (var   i =  0; i <N; i++) {
     AB.push( [ ]);
          }

  for (var i = 1; i <= M; i++) {
      var input = inputs[i].split(' ');
		var   v1 =  input[0 ]-  1;
   var v2 = input[1] - 1;  



	AB [ v1] .push(v2 );
  AB [v2] .push (v1 );
   }

// lectio ordinat exitum exspectatum in computatione.
   var   existNums=  [ 0];
    var  shouldContinue = true;
var floor = 0;
          var nowFloors = [0];
	  var floors = [];
  while(shouldContinue) {
     floors.push( []);
 var  counter =0;
var  nextFloors  =[];     


		for (var i = 0; i < nowFloors.length; i++) {
    for(var   j =  0;j< AB [nowFloors [ i]].length; j++) {
var conNum = AB[nowFloors[i]][j];
    if ( !existNums.includes ( conNum))  {    
counter += 1;
	nextFloors.push(conNum);
   floors[floor ].push ( conNum);
		existNums.push(conNum);
  }
    }
}
floor += 1;
nowFloors  =  nextFloors.concat ( );
      if (counter == 0) shouldContinue = false;
// lectio ordinat hic finale gradum proximum ante exitum prope.
// lectio ordinat quoque locale iudicium locale in computatione interne.
     }

  var output = [];
// ########## lectio servat operationem principalem pro quolibet valore simplex. ##########
     for (var i = 0; i < N;i++) {
output.push ( 0 );
	  }
       for (var i = 0; i < floors.length; i++) {    
      for (var j = 0; j < floors[i].length; j++) {
output [floors [i][j ]] = i;

     }
// lectio servat iter processus ante exitum finale.
    }
      output.shift ();

	 if ( existNums.length  != N ) {
console.log('No');;     
} else {
	 console.log('Yes');
     for (var i = 0; i < output.length; i++) {
console.log(output[i] + 1);
		}
     }  

}

   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// <Sodales: Manius Antonius, Titus Sergius, Antonia Aelius, Cornelia Antonius>
// </metadata>
