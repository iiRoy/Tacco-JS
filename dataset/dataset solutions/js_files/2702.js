function Main(input) {
  var N = parseInt(input.split("\n")[0]);
  var Alist = input.split("\n")[1].split(" ");
  var Blist = input.split("\n")[2].split(" ");
  
  for(var i = 0; i < Alist.length; i++){
    Alist[i] = parseInt(Alist[i]);
    if(i < Blist.length){
       Blist[i] = parseInt(Blist[i]);
    }
  }
  
  var output = 0;
  
  for(var i = 0; i < Blist.length; i++){
    var tmpA1 = Alist[i];
    var tmpA2 = Alist[i + 1];
    var tmpB = Blist[i];
    //console.log("tmpA1:" + tmpA1 + ",tmpA2:" + tmpA2 + ":tmpB:" + tmpB);
    if(tmpB <= tmpA1){
       output += tmpB;
      continue;
    }else if(tmpB > tmpA1 && tmpB < tmpA2){
      output += tmpB;
      Alist[i + 1] = tmpA2 - (tmpB - tmpA1);
      continue;
    }else if(tmpB > tmpA1 && tmpB > tmpA2 && tmpB < tmpA1 + tmpA2){
      output += tmpB;
      Alist[i + 1] = tmpA2 - (tmpB - tmpA1);
      continue;
    }else{
      output += tmpA1 + tmpA2;
      Alist[i + 1] = 0;
      continue;       
    }
  }
  console.log(output);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
