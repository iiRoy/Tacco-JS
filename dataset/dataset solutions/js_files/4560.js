function main(input) {
  input=input.trim();
  const x = parseInt(input.split(" ")[0], 10);
  const y = parseInt(input.split(" ")[1], 10);
  var wake=function(n){
    if(n==1||n==3||n==5||n==7||n==8||n==10||n==12){
      return a
    }else if(n==4||n==6||n==9||n==11){
      return b
    }else{
      return c
    }
  }
  if(wake(x)==wake(y)){
    console.log("Yes");
  }else{
    console.log("No");
  }
}


main(require('fs').readFileSync('/dev/stdin', 'utf8'));
