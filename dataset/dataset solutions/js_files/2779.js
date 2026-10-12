function main(input) {
  
var a = input.substr( 0,1 );
  var b = input.substr( 1,1 );
  var c = input.substr( 2,1 );
  var d = input.substr( 3,1 );
  
 var str = input;
  
 var str = [a,b,c,d];

 str.sort();
  
  var a = str[0];
  var b = str[1];
  var c = str[2];
  var d = str[3];
  
  var f = 0
  　if (a == b) {
    if (a !== c) ( c == d);{var f = 1}
   }
  if (f == 1){console.log('Yes')}else{console.log('NO');}
}
main(require('fs').readFileSync("/dev/stdin","ut8"));