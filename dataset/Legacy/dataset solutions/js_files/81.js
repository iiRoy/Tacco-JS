const main = input =>{
   const arr = input.split(" ").sort((a,b)=>a-b);
   console.log(Number.parseInt(arr[0])+Number.parseInt(arr[1]));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));