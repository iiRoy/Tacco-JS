function Main(input) {
	input = input.split("\n");
	const N = parseInt(input[0])
	const As = input.slice(1).map(x => parseInt(x))
	var colors = {0:As[0]}
	var colorId = 0
	for(i=1; i < N; i++){
		var nowColorId = null
		for(j=0; j <= colorId; j++){
			if(colors[j] < As[i] && (nowColorId == null || colors[nowColorId] < colors[j])){
				nowColorId = j
			}
		}
		if(nowColorId == null){
			colorId++
			colors[colorId] = As[i]
		}else{
			colors[nowColorId] = As[i]
		}
	}
	console.log(colorId+1)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));