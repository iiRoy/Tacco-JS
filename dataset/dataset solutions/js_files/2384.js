function Main(input) {
	input = input.split("\n");
	var T = input[0].split(" ");
	var A = input[1].split(" ");
	var B = input[2].split(" ");
	for(var i=0; i<2; i++){
    	T[i] = Number(T[i]);
        A[i] = Number(A[i]);
        B[i] = Number(B[i]);
    }
	var sa1 = T[0]*A[0]-T[0]*B[0];
    var sa2 = sa1+T[1]*A[1]-T[1]*B[1];
    if(sa2 == 0){
       console.log('infinity');
    }else if(sa1*sa2 > 0){
      console.log(0);
    }else if(sa1/sa2-Math.ceil(sa1/sa2) == 0){
      console.log(Math.ceil(sa1/sa2)*2);
    }else{
      console.log(-Math.ceil(sa1/sa2)*2+1);
    }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));