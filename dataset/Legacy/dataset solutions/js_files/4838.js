process.stdin.resume();
process.stdin.setEncoding('utf8');
 
// inputに入力データ全体が入る
function Main(input) {
  // 1行目がline1, 2行目がline2, …に入る
  var arg   = input.split("\n");
  var line0 = arg[0].split(" ");
//  var line1 = arg[1].split(" ");
//  var line2 = arg[2].split(" ");
//  var line3 = arg[3].split(" ");

  var a = Number(line0[0]);
  var b = Number(line0[1]);
  var c = Number(line0[2]);
//  var d = Number(line1[1]);

  var ans = "initial_answer";
  //console.log( "[INPUT] "+ input1 +" "+ input2 +" "+ input3 + " " + input4 );
  
  // LOGIC //
  ans = 0;
  
  for(var i=a; i<=b; i++){
    //console.log(i);
    if(i%c===0) ans++;
  }

    
  


  console.log(ans);

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
