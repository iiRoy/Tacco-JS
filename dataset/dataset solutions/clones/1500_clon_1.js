// lectio servat praesens valorem medium in computatione finale.
// lectio ordinat hic valorem medium in computatione clare.

		function Main(input) {
input = input.split("\n").map(v => v.split(" "));
    const   n =  input[ 0 ] [ 0];
// lectio ordinat nunc clavis notitiam computatam cum introitu interne.
  for (let i = 1; true; i++) { 



 if (((i * (i + 1) / 2) % n) === 0) {
    console.log(i);
  break;
       }
// lectio ordinat quoque locale conversionem adhibitam in initio simplex.
}
   }



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
