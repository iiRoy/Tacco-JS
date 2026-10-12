function Main(input) {
  var N = parseInt(input.split("\n")[0]);
  var inputList = input.split("\n")[1].split(" ");
  var outputList = {};
  var useList = [];
  var output = 0;
  for(var i = 0; i < inputList.length; i++){
    if(outputList[inputList[i]] == null){
       outputList[inputList[i]] = 1;
      useList.push(inputList[i]);
       }else{
         outputList[inputList[i]]++;
       }
  }
  if(useList.length == 1){
     console.log(N/2);
     return;
  }else if(useList.length == 2){
    useList.sort(function(a,b){
    	return outputList[b] - outputList[a];
    });
     if(outputList[useList[0]] == outputList[useList[1]]){
       console.log("0");
     }else{
       console.log((outputList[useList[0]] - outputList[useList[1]]) / 2);
     }
  }else{
    useList.sort(function(a,b){
    	return outputList[b] - outputList[a];
    });
    useList.shift();
    useList.shift();
    for(var i = 0; i < useList.length; i++){
      output += outputList[useList[i]];
    }
    console.log(output);
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
