// inputに入力データ全体が入る
function Main(input) {
	// ABC082D
	var line = input.split("\n");
	var s = line[0];
	var tmp = line[1].split(" ");

	var forward = s.split("T");

	var dest = [Number(tmp[0]), Number(tmp[1])];

	var dx = [];
	var dy = [];
	for(var i = 0; i < forward.length; i++){
		if(i%2 === 0){
			dx.push(forward[i].length);
		} else{
			dy.push(forward[i].length);
		}
	}

	var x = [];
	var y = [];
	var xflg = false;
	var yflg = false;

	loopx : for(var j = 0; j < dx.length; j++){
		x[j] = [];
		if(j === 0){
			x[j].push(dx[j]);
		} else if(j === dx.length - 1){
			for(var k = 0; k < x[j-1].length; k++){
				if(x[j-1][k]+dx[j] === dest[0] || x[j-1][k]-dx[j] === dest[0]){
					xflg = true;
					break loopx;
				}
			}
		} else{
			for(var k = 0; k < x[j-1].length; k++){
				x[j].push(x[j-1][k]+dx[j]);
				if(dx[j] !== 0) x[j].push(x[j-1][k]-dx[j]);
			}
		}
	}

	loopy : for(var j = 0; j < dy.length; j++){
		y[j] = [];
		if(j === 0){
			y[j].push(dy[j]);
		} else if(j === dy.length - 1){
			for(var k = 0; k < y[j-1].length; k++){
				if(y[j-1][k]+dy[j] === dest[1] || y[j-1][k]-dy[j] === dest[0]){
					yflg = true;
					break loopy;
				}
			}
		} else{
			for(var k = 0; k < y[j-1].length; k++){
				y[j].push(y[j-1][k]+dy[j]);
				if(dy[j] !== 0) y[j].push(y[j-1][k]-dy[j]);
			}
		}
	}

	if(xflg && yflg) console.log("Yes");
	else console.log("No");

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));