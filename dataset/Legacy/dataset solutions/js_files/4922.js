const { parse } = require("path");

function Main(input) {
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	var N = parseInt(input[0][0], 10);
	var arr_TA = [];
	for (var i = 0; i < N; i++){
		arr_TA.push(input[i + 1].map(e => parseInt(e, 10)));
	}
	var tmp = [0, 0];
	var n;
	for (var i = 0; i < N; i++){
		if (arr_TA[i][0] >= tmp[0] && arr_TA[i][1] >= tmp[1]){
			tmp = [arr_TA[i][0], arr_TA[i][1]];
		} else if (arr_TA[i][0] >= tmp[0] && arr_TA[i][1] < tmp[1]){
			n = Math.ceil(tmp[1] / arr_TA[i][1]);
			tmp = [arr_TA[i][0] * n, arr_TA[i][1] * n];
		} else if (arr_TA[i][0] < tmp[0] && arr_TA[i][1] >= tmp[1]){
			n = Math.ceil(tmp[0] / arr_TA[i][0]);
			tmp = [arr_TA[i][0] * n, arr_TA[i][1] * n];
		} else if (arr_TA[i][0] < tmp[0] && arr_TA[i][1] < tmp[1]){
			n = Math.ceil(tmp[0] / arr_TA[i][0]);
			if (arr_TA[i][1] * n >= tmp[1]) ;
			else n =  Math.ceil(tmp[1] / arr_TA[i][1]);
			tmp = [arr_TA[i][0] * n, arr_TA[i][1] * n];
		}
	}
	console.log(tmp[0] + tmp[1]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 