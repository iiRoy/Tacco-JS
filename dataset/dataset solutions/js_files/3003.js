Main = input => {
    input = input[0].split(' ');
    var a = input[0], b = input[1], t = input[2];
    var ans=Math.floor(t/a);
    console.log(ans*b);
    
};
Main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
