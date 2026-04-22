

function main(arg) {
    arg = arg.split("\n")
    var tmp = arg[0].split(" ")
    var N = tmp[0]
    var X = tmp[1]
    var xi = arg[1].split(" ")
    
    xi.push(X)
    xi = xi.map(function(e){return parseInt(e,10)})
    
    xi.sort(function(a,b) {
        if (a > b) {
            return 1
        }
        return -1
    })
    
    if (xi.length === 2) {
        console.log(xi[1] - xi[0])
        return
    }
    
    
    var result = []
    
    for (var i = 1; i < xi.length; i++ ){
        result.push(xi[i] - xi[i-1])
    }
    
    result = result.filter(function (x, i, self) {
        return self.indexOf(x) === i;
    });
    
    if (result.length === 1) {
        console.log(result[0])
        return
    } else {
        while(1) {
            var _tmp = [];
            result = result.sort(function(a,b) {
                if (a > b) {
                    return 1
                }
                return -1
            })

            for (var i = 1; i < result.length; i++ ){
                _tmp.push(result[i] - result[i-1])
            }

            _tmp = _tmp.filter(function (x, i, self) {
                return self.indexOf(x) === i;
            });
            
            result = _tmp
            if (result.length === 1) {
                break;
            } else{
                result = _tmp
            }
        }
        console.log(result[0])
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
