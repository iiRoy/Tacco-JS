/// <reference path="nodelib/node.js"/>

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk)
{
	var a = chunk.trim().split(" ");
	a.sort(function (a, b) { return (a - b); });
	console.log(a.join(" "));
});