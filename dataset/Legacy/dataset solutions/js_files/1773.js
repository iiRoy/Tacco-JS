function Main(arg) {
    var arg = arg.trim().split('\n');
    let x = Number(arg[0].split(' ')[0]);
    let n = arg[0].split(' ')[1];
    
    if(n == 0){
      console.log(x);
      return;
    }
    
    let p = arg[1].split(' ');
    for(let i = 1; i < 101; i++){
      if(!p.includes(`${x-1*i}`)){
        console.log(x-1*i);
        return;
      } else if(!p.includes(`${x+i}`)){
        console.log(x+i);
        return;
      }
    }
    console.log('error');
    return;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));