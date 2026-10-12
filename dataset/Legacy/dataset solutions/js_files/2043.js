const Main = function(S){
function r(input){
var str = new String(input);
var out = "";
 for(var i = str.length; i > 0 ; i--){
   out += str.charAt(i-1);
 }
return out;
};
var x = new String(S);
var n = x.length;
    console.log(r(S))
if(r(S) == S){

  var b = x.substring(0,(n-1)/2);

  if(r(b) == b){
    var c = x.substring((n+3)/2,n-1);
    if(r(c) == c){
      console.log("Yes");
    }else{console.log("No");}
  }else{console.log("No");}
}else{console.log("No");}
};
Main(require("fs").readFileSync("/dev/stdin", "utf8"));