const main = (stdin) => {
    const input = stdin.split("\n");
    const [ n, q ] = input[0].split(' ').map(x => Number(x));
    const balls = input[1].split(' ');
      
 
    for(let i=2;i<q+2;i++) {
      const [ s, e ] = input[i].split(' ').map(x => Number(x));
      console.log(balls.slice(s-1, e).filter((elm, index, self) => self.indexOf(elm) === index).length)
    }
 
}
 
main(require("fs").readFileSync("/dev/stdin", "utf8"));