var main = function(input) {
var Ar = input.split('\n');
var N=parseInt(Ar[0]);
var D=Ar[1].split(' ').map(x=>parseInt(x));
D=D.sort();
var M=parseInt(Ar[2]);
var T=Ar[3].split(' ').map(x=>parseInt(x));
T=T.sort();
var Ans ='No';
var T_i;
for (var i = 0; i <M; i++) {
     T_i=T.shift();
     var LL=D.length;
     for(var k=0;k<LL;k++){
         if(T_i == D[k]){
         D=D.slice(k+1);
         break;
              }
         }
    }
T.push(0);
var Ar =[0];
if(T == Ar ){
  Ans='Yes';
  }
console.log(Ans);
    return 0; 
}

main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
