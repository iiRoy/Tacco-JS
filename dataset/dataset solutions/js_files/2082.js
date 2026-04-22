function Main(input) {
  if(!(input.length)%2){console.log("No");return;}
  
  var ret = "Yes";
  for(i=0;i<input.length;i=i+2) {
    if (input.indexOf("hi",i)!=-1){ret="No";break;}
  }
  console.log(ret);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
