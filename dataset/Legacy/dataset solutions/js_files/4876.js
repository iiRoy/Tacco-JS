// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	tmp = input[0].split(" ");
	
	var maxX = parseInt(tmp[0], 10);
	var minX = 0;
	var maxY = parseInt(tmp[1], 10);
	var minY = 0;
	
	for(var i = 1;i < input.length;i++){
		tmp = input[i].split(" ");
		if(tmp[2] == 1){
			if(minX < parseInt(tmp[0], 10)){
				minX = parseInt(tmp[0], 10);
			}
		} else if(tmp[2] == 2){
			if(maxX > parseInt(tmp[0], 10)){
				maxX = parseInt(tmp[0], 10);
			}
		}  else if(tmp[2] == 3){
			if(minY < parseInt(tmp[1], 10)){
				minY = parseInt(tmp[1], 10);
			}
		}   else if(tmp[2] == 4){
			if(maxY > parseInt(tmp[1], 10)){
				maxY = parseInt(tmp[1], 10);
			}
		} 
	}
	
	if((maxX - minX) *(maxY - minY) < 1){
		console.log(0);
	} else {
		console.log((maxX - minX) *(maxY - minY));
	}
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));