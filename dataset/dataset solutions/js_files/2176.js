function Main(input){
  input=input.split("\n");
  num = input[0];
  var a = input[1].split(" ");
  a.sort(function(a,b){
    return parseInt(a,10) - parseInt(b,10);
  });
  for(var n = 0; n < num-1; n++){
    if(a[n]===a[n+1]){
      console.log("NO");
      return;
    }
  }
  console.log("YES");
}