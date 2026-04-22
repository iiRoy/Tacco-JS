function main (input) {
	var input = input.split('\n');
    var input1 = input[0].split(' ');
    N = input1[0];
	var X = parseInt(input1[1], 10);
    var m =[];
	for (var i = 0; i < input.length - 1; i++) {
	    m.push(parseInt(input[i + 1], 10));
	}
	var count = 0;
	var min = Math.min.apply(1e9, m);

	/* まず一つずつカウント*/
	for (var n = 0; n < m.length; n++) {
		X = X - m[n]
		count++
	}
	count = count + Math.floor(X / min);

	console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));