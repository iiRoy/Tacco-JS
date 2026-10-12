function main(input) {
const a1, a2, a3;
const sum = a1 + a2 + a3;
if (sum <= 21){
console.log("win");	
}else{
console.log("bust");	
}
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

