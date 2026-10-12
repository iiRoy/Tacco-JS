// parameter "input" gets all data
function Main(input) {
	// the first line is assigned to input[0], the second line is assigned to input[1] similarly.
	var splitInput = input.split("\n");
	var n = (splitInput[0])
	var plateArray = splitInput.slice(1).map(function(e){
		var splitab = e.split(" ")
		return [parseInt(splitab[0]),parseInt(splitab[1]),parseInt(splitab[0])+parseInt(splitab[1])]
	}).sort(function(x,y) {
		if (x[2] < y[2]) {
			return -1;
		}
		if (x[2] > y[2]) {
			return 1;
		}
		  return 0;
	})
	
	var aresult = 0
	var bresult = 0
	
	for (var i=0; i<n; i++){
		var j = 0
		var j0 = 0
		while (i+j < n && plateArray[i+j][2] == plateArray[i][2]){
			if (plateArray[i+j][i%2] > plateArray[i+j0][i%2]){
				j0 = j
			}
			j++
		}
		if (j0 != 0) {
			var tmp = plateArray[i].slice(0)
			plateArray[i] = plateArray[i+j0].slice(0)
			plateArray[i+j0] = tmp
		}
		if (i%2 == 0) {
			console.log('a take %d', plateArray[i][i%2])
			aresult += plateArray[i][i%2]
		} else {
			console.log('b take %d', plateArray[i][i%2])
			bresult += plateArray[i][i%2]
		}
	}
	
	//output
	console.log('%d',aresult-bresult);
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));