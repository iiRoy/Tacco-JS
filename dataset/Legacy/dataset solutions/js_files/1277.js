line = require('fs').readFileSync(0, 'ascii').split('\n');
line = line.slice(1, parseInt(line[0]) + 1);
num_to_card = ['S', 'H', 'C', 'D'];
card_to_num = {'S': 0, 'H': 13, 'C': 13*2, 'D': 13*3};
map = []
for (i = 0; i < 52; i++) map.push(true);

line.forEach(function(line) {
	var ary = line.split(' ');
	map[card_to_num[ary[0]] + parseInt(ary[1]) - 1] = false;
});

for (i = 0; i < 4; i++)
	for (j = 0; j < 13; j++)
		if (map[i*13+j]) console.log(num_to_card[i], j + 1);