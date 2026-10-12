// inputに入力データ全体が入る
function Main(input) {
	var line = input.split("\r\n");
	var s = line[0];
	var tmp = line[1].split(" ");

	var forward = s.split("T");
	var firstStep = forward[0].length;

	var dest = [Math.abs(Number(tmp[0])-firstStep), Math.abs(Number(tmp[1]))];

	var dx = [];
	var dy = [];
	var sumx = 0;
	var sumy = 0;

	for(var i = 1; i < forward.length; i++){
		if(i%2 === 0){
			dx.push(forward[i].length);
			sumx += forward[i].length;
		} else{
			dy.push(forward[i].length);
			sumy += forward[i].length;
		}
	}

	dx.sort(function(a,b){
		return a-b;
	});
	dy.sort(function(a,b){
		return a-b;
	});

	var canReach = function(d, dest, sum){
		if(dest < sum){
			if((sum-dest)%2 === 1){
				console.log("No");
				return false;
			} else{
				var backStep = (sum-dest)/2;
				var dd = [];
				for(var j = 0; d[j] <= backStep; j++){
					var l = dd.length;
					dd.push(d[j]);
					if(d[j] === backStep){
						return true;
					}
					for(var k = 0; k < l; k++){
						dd.push(d[j] + dd[k]);
						if(d[j] + dd[k] === backStep){
							return true;
						}
					}
				}
				return false;
			}
		} else if(dest === sum){
			return true;
		} else{
			return false;
		}
	}


	if(dest[0] > sumx || dest[1] > sumy){
		console.log("No");
		return false;
	} else if(dest[0] === sumx && dest[1] === sumy){
		console.log("Yes");
		return false;
	} else{
		if(canReach(dx, dest[0], sumx) && canReach(dy, dest[1], sumy)){
			console.log("Yes");
			return false;
		} else{
			console.log("No");
			return false;
		}
	}

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));