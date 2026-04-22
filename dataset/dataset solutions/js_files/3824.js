function Main(input){
    var xs = input.trim().split(' ').map(v=>parseInt(v,10));
    
    a = xs[0];
    b = xs[1];
    c = xs[2];
    d = xs[3];
    
    if((Math.abs(a-b <=d)) ||(Math.abs(a-b <=d) && Math.abs(b-c <=d))){
      console.log('Yes');
    }else{
      console.log('No');
    }
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));