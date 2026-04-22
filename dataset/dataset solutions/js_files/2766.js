function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  var L = Number.parseInt(inputStr[0]);
  var R = Number.parseInt(inputStr[1]);
  var arr = [];
  var min = L;  
  if ( L * R > 2019){
    if ( R - L < 2019) {
      for(var i1 = L; i1 < R; i1++){
        for(var i2 = i1+1 ; i2 < R+1; i2++){
          var tmp = (i1 * i2) % 2019;
          if(tmp === 0){
            min = tmp;
            break;
          } else {
            min = tmp < min ? tmp : min;
          }
        }
      }
	  console.log(min);
    } else {
      console.log(0);
    }
  } else {
    //LとRの積が2019を超えないなら計算する必要がない
    console.log(L * (L+1));
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
