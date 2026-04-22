// inputに入力データ全体が入る
function Main(input) {
	var tmp = input.split(" ");
  var W = Number(tmp[0]);
  var H = Number(tmp[1]);
  var x = Number(tmp[2]);
  var y = Number(tmp[3]);
  
  var result = 0;

  var maxValue = 0;
  var maxCount = 0;

  if(x === W/2 && y === H/2) {
    maxValue = (W * H) / 2;
    maxCount = 1;
  }
  else if(x === W || y === H || x === W/2 || y === H/2){
    maxValue = (W * H) / 2;
  }
  else if( (x / y) === (W / H) || ((x/y) * x + y) === H ) {
    maxValue = (W * H) / 2;
    maxCount = 1;
  }
  else {
    var minSquireX = y/x * H;
    var minSquireY = x/y * W;
    var minSquire = 0;

    if(minSquireX < W){
      minSquire = (x - minSquireX) * (H -y);
    }
    else if(minSquireY < H){
      minSquire = (W - x) * (y - minSquireY);
    }

    var calc1 =  (W - x) * (H - y) / 2 + (x * y) + minSquire;

    var calc2 =  W * H - calc1;

    if(calc1 > calc2) {
      maxValue = calc1;
    }
    else {
      maxValue = calc2;
    }
  }
  result = (W * H) - maxValue;
  
 	//出力
 	console.log(result + ' ' + maxCount);
 }
 //*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
