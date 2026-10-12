function Main(input){
	input = input.split(' ');
    if(input[0] <= 8 & input[1] <=8){
    console.log('Yay!');
    }else{
    console.log(':(');
    }
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));