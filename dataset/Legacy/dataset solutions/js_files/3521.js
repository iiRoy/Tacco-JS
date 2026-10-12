// inputに入力データ全体が入る, 10)
function Main(input) {
	var nums = input.split(' ');
	nums = nums.map( val => parseInt(val, 10) );

	// num3 <= num2 <= num1
	var num1 = Math.max(...nums);
	nums.splice(nums.indexOf(num1), 1);

	var num2 = Math.max(...nums);
	nums.splice(nums.indexOf(num2), 1);

	var num3 = Math.max(...nums);
	nums.splice(nums.indexOf(num3), 1);
	console.log(parseInt(num1.toString() + num2.toString(), 10) + num3);
}

// ※この行以降は編集しない (標準入力から一度に読み込みMainを呼び出します)
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
