package main

import (
	"fmt"
	"math"
)
func main(){
	var N,maxN int
	fmt.Scan(&N)
	n := 10
	while(true){
		a := math.Pow(n,5)
		b := math.Pow(n-1,5)
		if(a-b>math.Pow(10,9)){
			maxN = n+1
			break
		}
		n++
	}
	for  i := -maxN; i < maxN; i++ {
		for j := -maxN; j < maxN; j++ {
		   a := Math.pow(i, 5)
		   b := Math.pow(j, 5)
		  if a - b === N {
			A := i
			B := j
			console.log(A, B)
			return
		  }
		}
	  }


}