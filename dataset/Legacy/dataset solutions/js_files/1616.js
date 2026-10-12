function Main(input) {
  let [l, ...valArr] = input.split('\n')
  valArr = valArr.map(e=>parseFloat(e)).sort(function(a,b) { return a - b})
  let result = []
  let counter = 0
  for(let ele of valArr){
    let opArr = valArr.slice(++counter, valArr.length)
    let temp = opArr.filter(e=> (e*ele)%1===0)
    if(temp.length){result = [...result, ...temp]}
  }
  console.log(result.length)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));