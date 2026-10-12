function Main(input){
  var tmp = input.split(' ');
        var N = Number (tmp [0 ]);
		var   D= Number (tmp[1] );     




 console.log(Math.ceil(N/(D*2+1)));
	}  
  Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
