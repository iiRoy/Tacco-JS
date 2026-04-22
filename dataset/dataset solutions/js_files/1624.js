function Main(input) {
  	let counter = 0
	let tempArr = input.split('\n')
    let target = Number(tempArr[0].split(' ')[1])
    let coordinatesArr = tempArr.splice(1,tempArr.length-1)
    for(let i=0;i<coordinatesArr.length;i++){
    	let arr = coordinatesArr[i].split(' ')
        let x = Number(arr[0])
        let y = Number(arr[1])
      	let result = Math.sqrt(Math.pow(x,2)+Math.pow(y,2))
        if(Math.round(result) >= target){
        	++counter
        }
    }
  	console.log(counter)
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));