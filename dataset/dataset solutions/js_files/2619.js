function Main(input) {
  var N = parseInt(input.split("\n")[0].split(" ")[0]);
  var K = parseInt(input.split("\n")[0].split(" ")[1]);
  var tmpList = input.split("\n")[1];
  var tmpListAonly = tmpList.split(" ").map((tmpListAonly)=>Number(tmpListAonly));
  var tmpListBonly = (tmpList + " " + tmpList).split(" ").map((tmpListBonly)=>Number(tmpListBonly));
  
  var flag = false;
  for(var i = 0; i < tmpListAonly.length - 1; i++){
    if(tmpListAonly[i] != tmpListAonly[i + 1]){
      flag = true; 
      break;
    }
  }
  if(!flag){
     console.log("0");
    return;
  }else{
     var resultList = [];
    var result = 0;
     for(var i = 0; i < tmpListAonly.length; i++){
       for(var j = i + 1; j < tmpListAonly.length; j++){
         var mae = tmpListAonly[i];
         var ato = tmpListAonly[j];
         if(mae > ato){
            result++;
         }
       }
     }
    resultList.push(result);
    result = 0;
	for(var i = 0; i < tmpListBonly.length; i++){
       for(var j = i + 1; j < tmpListBonly.length; j++){
         var mae = tmpListBonly[i];
         var ato = tmpListBonly[j];
         if(mae > ato){
            result++;
         }
       }
     }
    resultList.push(result);
    result = 0;
    if(K <= 2){
       console.log(resultList[K - 1]);
       }else{
         var count = 2;
        while(count != K){
          var nextAdd = resultList[0] + resultList[1] + resultList[1];
          resultList.push(nextAdd);
          resultList.shift();
          count++;
        }
         console.log(resultList[1] % (1e9 + 7));
       }
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
