// parameter "input" gets all data
function Main(input) {
	// the first line is assigned to input[0], the second line is assigned to input[1] similarly.
  var input = input.split("\n");
  var sample = 'CODEFESTIVAL2016'.split('');
  var S = input[0].substring(0,16).split('');

  // var arr = tmp.map(function(n){return parseInt(n)});

  var max_iteration = 0;

  for (var i=0, len=sample.length; i<len; i++){
    if(S[i]!==sample[i]){
      max_iteration++;
    }
  }

	//output
	console.log(max_iteration);
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
