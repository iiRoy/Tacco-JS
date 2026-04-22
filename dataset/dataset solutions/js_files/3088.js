function Main(input){
  var ary = [];
  var aryLen = input.split("\n")[0].split(" ")[0];
  for(var i=0;i<aryLen;i++){
  	ary.push(1);
  }
  var str = input.split("\n")[1];
  for(var i=2;i<input.split("\n").length;i++){
  	var jumon = input.split("\n")[i];
    var newAry = [];
    for(var j=0;j<aryLen;j++){
        newAry.push(0);
    }
    if(jumon[2]=="L"){
      for(var j=0;j<str.length;j++){
        if(j!=0||str[j]!=jumon[0])newAry[str[j]==jumon[0]?j-1:j]+=ary[j];
      }
    }else{
      for(var j=0;j<str.length;j++){
        if(j!=aryLen-1||str[j]!=jumon[0])newAry[str[j]==jumon[0]?j+1:j]+=ary[j];
      }
    }
    ary=newAry.concat();
  }
  var golems = 0;
  for(var i of ary)golems+=i;
  console.log(golems);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));