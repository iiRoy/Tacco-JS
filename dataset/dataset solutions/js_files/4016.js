// inputに入力データ全体が入る
function Main(input) {
	var line = input.split("\n");
	var tmp = line[0].split(" ");
	var height = Number(tmp[0]);
	var width = Number(tmp[1]);
	var step = Number(tmp[2]);
	var mapping = [];
	for(var i = 1; i < height + 1; i++){
		var row = line[i].split(" ");

		for(var j = 0; j < row.length; j++){
			var A = Number(row[j]);
			mapping[A] = {"x" : i, "y" : j+1};
		}
	}

	var num_exams = Number(line[height+1]);
	var from = [];
	var to = [];
	for(var j = 1; j < num_exams + 1; j++){
		var tmp = line[height+1+j].split(" ");
		from.push(Number(tmp[0]));
		to.push(Number(tmp[1]));
	}
	var memo = [];
	var ans = [];

	for(var k = 0; k < from.length; k++){
		ans[k] = 0;
		if(!memo[from[k]]) memo[from[k]] = [];
		if(memo[from[k]][to[k]]){
			ans[k] = memo[from[k]][to[k]];
			continue;
		}
		var loop = (to[k]-from[k])/step;
		for(var l = 0; l < loop; l++){
			var frompoint = mapping[from[k]+l*step];
			var topoint = mapping[from[k]+(l+1)*step];
			ans[k] += Math.abs(topoint.x-frompoint.x)+Math.abs(topoint.y-frompoint.y);
			memo[from[k]][from[k]+(l+1)*step] = ans[k];
		}
	}

	console.log(ans.join("\n"));
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));