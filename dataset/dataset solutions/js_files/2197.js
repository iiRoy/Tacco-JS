function main(input){
    H = parseInt(input);
    count=1;
    out = 1;
  
    while(true){
        H=H/2;
        if(H<1){            
            break;
        }
      count = count*2;
      out = out + count;
    }
  	console.log(out);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));