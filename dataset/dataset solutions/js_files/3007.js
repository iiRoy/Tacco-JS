function Main(input){
   input = input.split("\n");
   v_args = input[1].split(" ");
   c_args = input[2].split(" ");
  
  var num = parseInt(input[0],10);
  var value = new Array(num);
  var cost = new Array(num);
  var sum = 0;
  for(var i=0;i<num;i++){
    value[i] = parseInt(v_args[i],10);
    cost[i] = parseInt(c_args[i],10);    
  }
  for(var i=0;i<num;i++){
    var bnf = value[i]-cost[i];
    if(bnf > 0){
      sum +=bnf;
  }  
}
  console.log(sum);
}
Main(require("fs").readFileSync("/dev/stdin","utf-8"));