function main(arg) {
    arg = arg.split("\n");
    let N = parseInt(arg[0].split(" ")[0]);
    let H = parseInt(arg[0].split(" ")[1]);
    let W = parseInt(arg[0].split(" ")[2]);
    
    let count = 0;
    arg.shift();

    
    for(let i=0; i<arg.length; i++) {
        let h = parseInt(arg[i].split(" ")[0]);
        let w = parseInt(arg[i].split(" ")[1]);
        
        if( h >= H && w >= W ) {
            count++;
        }
    }
    
    console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));