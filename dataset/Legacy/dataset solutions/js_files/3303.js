//実験１：尺取法と累積和
//価値の高い順にソート
//「重さの合計」で累積和をとって尺取法で処理してみる。
function Main(input){
  //パラメータ受け取り
  input = input.split("\n");
  inputStr = input[0].split(" ");
  var N = Number.parseInt(inputStr[0]);
  var W = Number.parseInt(inputStr[1]);
  var obj = [];
  for(var i=0 ; i<N ; i++){
    inputStr = input[i+1].split(" ");
    obj.push(inputStr.map( inputStr => parseInt(inputStr)))
  }  
  //ソート(配列要素2番目が大きい順にソートする)
  obj.sort(function(a,b){return(b[1] - a[1]);});

  //console.log(obj);
  
  var wt = 0;
  var val = 0;
  var ans = 0;
  //尺取法(左辺はi、右辺はj)
  for( var i=0 ; i<N ; i++){
    //console.log("val=",val,"に",obj[i][1],"を加算");
    wt += obj[i][0];
    val += obj[i][1];
    var j=i+1;
    while(j<N){
      if(wt+obj[j][0]<=W){
        //次の要素を足しこむ
        //console.log("val=",val,"に",obj[j][1],"を加算");
        wt += obj[j][0];
        val += obj[j][1];
        j++;
      }else{
		break;
      }
    }
    ans = Math.max(val,ans);
    //console.log("val=",val,"から",obj[i][1],"を除算");
    wt -= obj[i][0];
    val -= obj[i][1];
  }
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
