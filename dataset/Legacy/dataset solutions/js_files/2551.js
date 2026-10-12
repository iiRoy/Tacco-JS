function Main(input) {
    var obj = {
    	'Sunny' : 'Cloudy',
        'Cloudy' : 'Rainy',
        'Rainy' : 'Sunny'
    };
  
  console.log(obj[input]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
