function Weather(s){
	switch(s){
		case 'Sunny';
			console.log('Cloudy');
			break;
		case 'Cloudy';
			console.log('Rainy');
			break;
		case 'Rainy';
			console.log('Sunny');
			break;
		default;
			console.log('Other');
			break;
	}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}