function Main (input) {
    var lines = input.split("\n");
    lines.forEach(function(arr){
        if(arr == "0 0") break;
        var r = arr.split(" ").map(Number);
        h = r[0]; w = r[1];
        console.log(Array(w+1).join("#") + "\n" +
                    Array(h-1).join("#" + Array(w-1).join(".") + "#\n") +
                    Array(w+1).join("#") + "\n"
                    );
    });
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));