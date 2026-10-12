var output = function (input) {
	if (input === 1) return 1;
    if (input%2 === 0) {
    	return (input/2) / input;
    } else {
    	return (input/2 + 1 ) / input;
    }
}

output(input);