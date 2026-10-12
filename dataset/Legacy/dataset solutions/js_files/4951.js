// parameter "input" gets all data
function Main(s) {
	// the first line is assigned to input[0], the second line is assigned to input[1] similarly.


	input = s.split("\n");

  var first_word = input.slice(0, 4);
  var second_word = input.slice(4);
	//output
	console.log(first_word + ' ' + second_word);
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
