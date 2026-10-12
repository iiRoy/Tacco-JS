function main(input) {
  input=input.trim();
  const n = parseInt(input.split(" ")[0], 10);
  var arr=[];
  for(var i=0; i<=25; i++){
    for(var j=0; j<=15; j++){
      arr.push(4*i+7*j)
    }
  }
  if(arr.indexOf(n)>=0){
    console.log("Yes");
  }else{
    console.log("No");
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

