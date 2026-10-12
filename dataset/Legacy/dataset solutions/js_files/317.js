function main(input) {
	var lines = input.split("\n");
	var dataSetLength = parseInt(lines[0]);
	var currentLine = 1;
	var salesTotals = [];
	while (currentLine < lines.length && dataSetLength > 0) {
		var sale = lines[currentLine].split(" ").map(function(value) {return parseInt(value)});
		if (sale.length === 1) {
			var validSales = salesTotals.reduce(function(result, value) {
				if (value.salesTotal >= 1000000) {
					result.push(value.id);
				}
				return result;
			}, []);
			if (validSales.length <= 0) {
				console.log("NA");
			} else {
				for(var i = 0; i < validSales.length; i++) {
					if(!isNaN(validSales[i])) console.log(validSales[i]);
				}
			}
			salesTotals = [];
		} else {
			var saleIndex = 0;
			for (; saleIndex < salesTotals.length; saleIndex++) {
				if (salesTotals[saleIndex].id === sale[0]) break;
			}
			var currentSalesTotal = (salesTotals[saleIndex] || {salesTotal: 0}).salesTotal;
			salesTotals[saleIndex] = {
				id: sale[0],
				salesTotal: currentSalesTotal + (sale[1] * sale[2])
			};
		}
		currentLine++;
	}
}
main(require('fs').readFileSync('/dev/stdin','utf8'));