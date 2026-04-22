function Main(input) {
	input = input.split(' ');
        var K=parseInt(input[0]);
        var A=parseInt(input[1]);
        var B=parseInt(input[2]);
        var D=B-A;
        var E=K-A;
        var biscuit=((E<2)||(D<3))?(K+1):(E%2===0)?(A+E*D/2+1):(A+(E+1)*D/2);
console.log(biscuit);

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));