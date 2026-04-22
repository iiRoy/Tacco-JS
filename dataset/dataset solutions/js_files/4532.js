// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
        //console.log('%s',input);
	input = input.split("\n");
	tmp = input[1].split(" ");
	var max = [];
	for(var i=0;i < 9;i++){
		max[i] = 0;
	}
	for(var i=0;i < tmp.length ;i++){
		var a = parseInt(tmp[i], 10);
		if(0 <= a && a < 400)max[0] = 1;
		else if(400 <= a && a < 800)max[1] = 1;
		else if(800 <= a && a < 1200)max[2] = 1;
		else if(1200 <= a && a < 1600)max[3] = 1;
		else if(1600 <= a && a < 2000)max[4] = 1;
		else if(2000 <= a && a < 2400)max[5] = 1;
		else if(2400 <= a && a < 2800)max[6] = 1;
		else if(2800 <= a && a < 3200)max[7] = 1;
		else if(3200 <= a && a <= 4800)max[8] += 1;
	}
	var b = 0;
	for(var i=0;i < 8;i++){
		b += max[i];
	}
	/*maxを求める*/
	var ma = b + max[8];
	if(ma > 8)ma = 8;
	/*minを求める*/
	var mi = b;
	//出力
	console.log('%d %d',mi,ma);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
