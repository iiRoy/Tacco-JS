var Recipe = (function () {
    function Recipe(name, materials) {
        this.getPrice = function () {
            var sum = 0;
            this.materials.forEach(function (m) {
                sum += m.price;
            });
            return sum;
        };
        this.name = name;
        this.materials = materials;
    }
    return Recipe;
})();
var Material = (function () {
    function Material(name, price) {
        this.name = name;
        this.price = price;
    }
    return Material;
})();
function searchByName(arr, name) {
    var result = null;
    arr.forEach(function (el) {
        if(el.name === name) {
            result = el;
        }
    });
    return result;
}
(function (input) {
    function compare(name) {
        var material = searchByName(materials, name), recipe = searchByName(recipes, name), price;
        if(recipe !== null) {
            recipe.materials.map(function (m) {
                m.price = compare(m.name);
                return m;
            });
            if(recipe.getPrice() < material.price) {
                price = recipe.getPrice();
            } else {
                price = material.price;
            }
        } else {
            price = material.price;
        }
        return price;
    }
    var inputs = input.replace(/\r/g, '').split("\n"), index = 0, n, i, purpose, minPrices, materials, recipes;
    while(true) {
        minPrices = [];
        materials = [];
        recipes = [];
        n = parseInt(inputs.shift());
        if(n === 0) {
            break;
        }
        for(i = 0; i < n; i++) {
            var tmp = inputs.shift().split(' '), m = new Material(tmp[0], parseInt(tmp[1]));
            materials.push(m);
        }
        n = parseInt(inputs.shift());
        for(i = 0; i < n; i++) {
            var tmp = inputs.shift().split(' '), r, materialList = [];
            tmp.slice(2).forEach(function (name, i) {
                var m = searchByName(materials, name);
                materialList.push(m);
            });
            r = new Recipe(tmp[0], materialList);
            recipes.push(r);
        }
        materials.forEach(function (material) {
            var recipe = searchByName(recipes, material.name);
            if(recipe !== null) {
                minPrices.push(new Material(material.name, compare(material.name)));
            } else {
                minPrices.push(material);
            }
        });
        purpose = searchByName(minPrices, inputs.shift());
        console.log(purpose.price);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));