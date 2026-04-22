function Main(input) {
input = input.split(" ");
var a = parseInt(input[0], 10);
var b = parseInt(input[1], 10);
var c = parseInt(input[2], 10);
var d = parseInt(input[3], 10);
var e = parseInt(input[4], 10);
var f = parseInt(input[5], 10);
var s = 0;
var s1 = 0;
var s2 = 0;
if(f-100*a <c){
  s1=100*a;
  s2=0;
}else{
for (i=0; i*100*a<=f; i++){
  for (j=0; i*100*a+j*100*b<=f; j++){
    for (k=0; i*100*a+j*100*b+k*c<=f; k++){
      for (l=0; i*100*a+j*100*b+k*c+l*d<=f; l++){
        if((k*c+l*d) <= (a*i+b*j)*e){
          if((100*(k*c+l*d)/(i*100*a+j*100*b+k*c+l*d)>s)){
            s=100*(k*c+l*d)/(i*100*a+j*100*b+k*c+l*d);
            s1=i*100*a+j*100*b+k*c+l*d;
            s2=k*c+l*d;
          }
        }
      }
    }
  }
}
}
  console.log('%s %d', s1, s2);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));