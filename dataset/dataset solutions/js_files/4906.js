main = (input)=> {
  let c = input.split(" ").map(a=>{return Number(a)})
  let x = c[0]
  let y = c[1]
  let z = c[2]
  let ans = () =>{
    if(x==y && x==z){
      return 1
    }
    else if(x == y || x==z || z==y){
      return 2
    }
    else{
      return 3
    }
  }
  console.log(ans())
}
main(require("fs").readFileSync('/dev/stdin', 'utf-8'))