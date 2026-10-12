const rl = require("readline");

let lines=[];
const reader = rl.createInterface({
	input: process.stdin,
	output: process.stdout
});

const g=(function*(){
    const gets = () => reader.once("line", s => g.next(s));
    str = yield gets();
    lines.push(str);
    str = yield gets();
    lines.push(str);
    str = yield gets();
    lines.push(str);
    lines[0] -= lines[1];
    lines[0] %= lines[2];
    console.log(lines[0]);

    process.exit();
})();
g.next();