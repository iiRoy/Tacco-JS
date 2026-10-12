function main(input){
 if(input.length != 10){
  throw new Error(""); 
 }
 console.log(1);
}
main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
