function Main(input) {
  var len = input.split("\n")[0];
  var list = input.split("\n")[1].split(" ");
  
  var used = [];
  var count = 0;
  for(var i = 0; i < list.length; i++){
    if(used.indexOf(list[i]) == -1){
       used.push(list[i]);
      count++;
       }
  }
  
  if(count % 2 == 1){
     console.log(count);
     }else{
     console.log(count - 1);
     }
  
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
