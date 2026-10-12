function Main(input){
	input1 = input.trim().split(' ').map(v=>parseInt(v,10));
    a = input1[0].
    b = input1[1];
    c = input1[2];
    d = input1[3];
    
    if(Math.abs(a-c<=d) || Math.abs(a-b <=d) && Math.abs(b-c <=d)){
    console.log(Math.abs(a,c<=d));
    }else{
    console.log('No');
    }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));