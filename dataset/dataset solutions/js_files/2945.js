// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  inputs = input.split("\n");

  var q = parseInt( inputs[0], 10 );

  var sum_a = 0;
  var sum_b = 0;
  var array_a = new Array();

  for ( var i=1;i<=q;i++){
    tmp = inputs[i].split(" ");

    if ( tmp[0] == 1 ){
      var a = parseInt( tmp[1], 10 );
      var b = parseInt( tmp[2], 10 );

      sum_a +=a;
      sum_b +=b;
      array_a.push(a);
    } else {
      var ave_a = sum_a / array_a.length;
      var mindist = (array_a[0] - ave_a) * (array_a[0] - ave_a);
      var min_a = array_a[0];

      for ( var j=0;j<array_a.length;j++){
        var tmpdist = (array_a[j] - ave_a) * (array_a[j] - ave_a);

        if ( tmpdist < mindist ){
          min_a = array_a[j];
        } else if (tmpdist == mindist ){
          min_a = array_a[j] < min_a ? array_a[j] : min_a;
        }

      }

      var value = 0;
      for ( var j=0;j<array_a.length;j++){
        if ( array_a[j] <= min_a){
          value += array_a[j] - min_a;
        } else {
          value += ( -array_a[j] + min_a);
        }
      }

      console.log('%d %d', min_a, value);

    
    }
  }

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));