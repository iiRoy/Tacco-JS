function Main(input) {
	input = input.trim();
  var len = parseInt(input.split("\n")[0]);
  var list = input.split("\n")[1].split(" ").map((list)=>Number(list));
  var output = "Yes";
  var four = 0;//4の倍数
  var two = 0;//2の倍数（4の倍数でない）
  for(var i = 0; i < list.length; i++){
    if(list[i] % 2 == 0 && list[i] % 4 != 0){
       two++;
    }else if(list[i] % 4 == 0){
      four++;
    }
  }
  //console.log("2の倍数:" + two);
  //console.log("4の倍数:" + four);
  //4の倍数がMath.floor(N/2)個以上あればOK
  //ない場合、2の倍数が足りない分*2個以上あればOKなはず
  if(Math.floor(len / 2) > four){
     var husoku = Math.floor(len / 2) - four;
     if(husoku * 2 > two){
        output = "No";
     }else{
       //console.log("2の倍数も使ってYes");
     }
  }else{
    //console.log("4の倍数だけでYes");
  }
  console.log(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
