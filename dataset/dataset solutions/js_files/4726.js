function Main(input) {
 var a=0;b=0;
 var str=input.split("\n");
 var str2=str[1].split(" ");
 for(i=0;i<str[0];i++){
  if(str2[i]%2)a++;
  else b++;
 }   
 if(b%2)console.log("YES");
 else console.log("NO");

}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));