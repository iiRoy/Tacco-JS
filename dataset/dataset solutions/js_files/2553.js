function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  var S = inputStr[0];
  var ans = "Yes";

  //console.log(S.length);
  
  //判定
  for(var i=0 ; i<S.length ; i++){
    if((i+1)%2===0){
      //偶数位置
      var str = "LUD";
    } else {
      //奇数位置
      var str = "RUD";
    }
    //console.log(str,S.substr(i,1),str.indexOf(S.substr(i,1)));

    if( str.indexOf(S.substr(i,1)) === -1 ){
      ans = "No";
      break;
    }
  }
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));