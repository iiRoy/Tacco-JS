var input="3\n101 9901 999999000001";

function main(input){
  var list = input.split("\n")[1];
  list = list.split(" ");
  var seki=list[0];
  for(var i=1; i<list.length; i++){
    seki=(BigInt(seki)*BigInt(list[i]));
  }
  if(seki>Math.pow(10,18)){
    	console.log(-1);
  }else{
    	console.log(seki);
  }
}main(input);