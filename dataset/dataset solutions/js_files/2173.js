function Main(input) {
input = input.split("\n");
input = input[1].split(" ");
input = input.sort(num);
  var flag = false;
  for(var i=1;i<input.length;i++){
  if(input[i-1]==input[i]){
  flag = true;
  }
  }
  if(flag)console.log("NO");
  else console.log("YES")
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());