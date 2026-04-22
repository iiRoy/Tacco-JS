function Main(input){
  var init;
  
  input = input.split('\n');
  init = input[0].split(' ');
  
  for(var i=0;i<input.length;i++){
    input[i] = parseInt(input[i],10);
}
  for(var i=0;i<init.length;i++){
    init[i] = parseInt(init[i],10);
  }
  var tmp;
  //昇順にソート	
  
  for(var i=1;i<input.length -1;i++){
    for(var j=1;j<input.length -1;j++){
      if(input[j]>input[i]){
        tmp = input[j];
        input[j] = input[i]
        input[i] = tmp;
      }
    }
  }
  
  var minTree;
  minTree = Math.abs(input[1]-input[init[1]]);
  //console.log(minTree);
  
  for(var i=1;i<input.length -2 -init[1] ;i++){
    //console.log(input[i + init[1]-1]-input[i]);
    if(minTree>input[i + init[1]]-input[i]){
      //console.log('a');
      //console.log(Math.abs(input[1]-input[i + init[1]-1]));
       minTree =input[i + init[1]]-input[i];
  }
  }
  
    console.log(minTree);
}
    
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));