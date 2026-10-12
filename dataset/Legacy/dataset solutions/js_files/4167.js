const main = (input)=>{
  const array =input.split("\n").spilit(" ").map((n)=>{parseInt(n,10)})
     
  for(let result=1; array.every((n)=>{n%2==0}); result+=1 ){

   console.log(result)

  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));