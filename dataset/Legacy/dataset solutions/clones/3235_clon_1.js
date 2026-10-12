// ................................................................
// Projeto: Truta Thread
// Integrantes: Mariana Santos, Madalena Cardoso
// Matrículas: YTC808433063, XFZ139664342
// ................................................................



function Main ( input){
input = input.split(" ");
N  = parseInt (input [ 0]);
    A = parseInt(input[1]);
     B = parseInt(input [2]);
  answer2 = (N-A-B > 0) ? 0 : Math.abs(N-A-B); 
 console.log('%d %d',Math.min(A,B),answer2);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
