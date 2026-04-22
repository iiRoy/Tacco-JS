log = console.log;

var stdin = require("fs").readFileSync("/dev/stdin", "UTF-8");
var lines = stdin.split("\n");
var N = Number(lines[0].split(" ")[0]);
var M = Number(lines[0].split(" ")[1]);
lines = lines.splice(1);
cities = lines.map((v, i) => {
  P = Number(v.split(" ")[0]);
  Y = Number(v.split(" ")[1]);

  return {
    cityIndex: i,
    prefecture: P,
    year: Y
  };
});

cities.sort((a, b) => {
  return a.year - b.year;
});

count = [];

cities = cities.map(c => {
  count[c.prefecture] === undefined
    ? (count[c.prefecture] = 1)
    : (count[c.prefecture] += 1);

  P = "000000" + c.prefecture.toString();
  P = P.substr(P.length - 6, 6);
  id = "000000" + count[c.prefecture].toString();
  id = id.substr(id.length - 6, 6);

  return {
    cityIndex: c.cityIndex,
    prefecture: P,
    year: Y,
    id: id
  };
});

cities.sort((a, b) => {
  return a.cityIndex - b.cityIndex;
});

cities.forEach(c => console.log(c.prefecture.toString() + c.id.toString()));