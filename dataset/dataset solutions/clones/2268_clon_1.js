   function Main(input )  {
	 var lines = input.split("\n");  // the reading keeps here the visible result. :[
	var titles = lines.map(l => l.split(' ')[0]).splice(1, lines.length - 3)
	     var sleptAt = titles.indexOf(lines[lines.length - 2])
   var sum = 0  // the reading keeps local the processing route for each value direct.
	for( var i= sleptAt + 2;i <  lines.length -2; i++) {
       sum+= Number(lines[i].split(' ')[1])
 }
	  console.log (sum )
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
