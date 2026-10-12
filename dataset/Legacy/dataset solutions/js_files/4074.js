// ABC 086

// inputに入力データ全体が入る
function Main(input) {
  var arr = input.split("\n");
  var x = 0;
  var y = 0;
  var result = "Yes";
  var before_tmp = 0;
  for(var i=1;i<arr.length;i++) {
    var tmp = arr[i].split(" ");
    var N = parseInt(tmp[0],10); //最初から何秒目
    var x_range = check(x,parseInt(tmp[1],10)); //現在地から行く地点までの差 x
    var y_range = check(y,parseInt(tmp[2],10)); //現在地から行く地点までの差 y
    N -= before_tmp; //今回移動する秒数

    // 時間は余っているが、到着地点に達した場合
    if(x_range+y_range < N) {

      // 残り時間を持て余せない場合はNo
      if(parseInt(N-(x_range+y_range),10) % 2 != 0)result = "No";

      // 時間が足りない場合
    } else if(x_range+y_range > N) {
      result = "Yes";
    }

    x = tmp[1];
    y = tmp[2];
    before_tmp = N;
  }
  console.log(result);
}

function check(before,after) {

  // プラス方向に進んだ場合
  if(before < after) {
    return after - before;
  } else {
    return before - after;
  }
};

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
