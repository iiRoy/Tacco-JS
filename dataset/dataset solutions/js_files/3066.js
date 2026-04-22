/// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");
  
 
  var a = [];
for (var f = 0; f < 5; f++) {
      var r= parseInt(input[f], 10);
  //   console.log(r);
           a[f] = r;}
    //  console.log(a);
     
  var total=0;
                 var b = [];  
    for (var i = 0;i<5;i++){
        var l = Math.ceil(a[i]/10) * 10;
      var total = total+l;
    }
    // console.log(total); 
     
  
     
     var mm = a[0]%10
   for (var i = 0;i<5;i++){ var m = a[i]%10;
                             if (m === 0){continue;}
                                if( mm >  m) { var mm =  m;}
                                         }
        
      //  console.log(mm);
 console.log(total-(10-mm));
  
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8")); 
 
 
 
 