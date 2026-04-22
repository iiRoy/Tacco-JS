i=require("fs").readFileSync("/dev/stdin","utf8")
s = i == 24 ? " Eve" : ""
s += i == 23 ? " Eve" : ""
s += i == 22 ? " Eve" : ""
i.match(/25|24|23|22/) && console.log("Christmas" + s)
