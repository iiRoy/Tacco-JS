const createCraft = (label, components) => ({
    label,
    components,
    costCalculator: () => components.reduce((total, comp) => total + comp.value, 0)
});

const createItem = (label, value) => ({
    label,
    value
});

((rawInput) => {
    const evaluatePrice = (targetLabel, itemCatalog, craftCatalog, priceCache) => {
        if (priceCache.has(targetLabel)) {
            return priceCache.get(targetLabel);
        }

        const baseItem = itemCatalog.get(targetLabel);
        let currentMinPrice = baseItem.value;

        const craftOption = craftCatalog.get(targetLabel);

        if (craftOption) {
            const craftedComponentsWithPrices = craftOption.components.map(comp => {
                return createItem(comp.label, evaluatePrice(comp.label, itemCatalog, craftCatalog, priceCache));
            });

            const tempCraft = createCraft(craftOption.label, craftedComponentsWithPrices);
            const craftCalculatedCost = tempCraft.costCalculator();

            if (craftCalculatedCost < currentMinPrice) {
                currentMinPrice = craftCalculatedCost;
            }
        }

        priceCache.set(targetLabel, currentMinPrice);
        return currentMinPrice;
    };

    const inputLines = rawInput.replace(/\r/g, '').split("\n");
    let linePointer = 0;

    const getNextLine = () => inputLines[linePointer++];
    const parseInteger = (str) => parseInt(str, 10);

    while (true) {
        const itemCatalog = new Map();
        const craftCatalog = new Map();
        const finalCosts = new Map();

        let itemCount = parseInteger(getNextLine());
        if (itemCount === 0) {
            break;
        }

        Array.from({ length: itemCount }).forEach(() => {
            const [itemName, itemValueStr] = getNextLine().split(' ');
            itemCatalog.set(itemName, createItem(itemName, parseInteger(itemValueStr)));
        });

        let craftCount = parseInteger(getNextLine());

        Array.from({ length: craftCount }).forEach(() => {
            const parts = getNextLine().split(' ');
            const craftName = parts[0];
            const componentNames = parts.slice(2);
            const componentsForCraft = componentNames.map(name => ({ label: name }));
            craftCatalog.set(craftName, createCraft(craftName, componentsForCraft));
        });

        const priceMemo = new Map();

        itemCatalog.forEach((item) => {
            const minPrice = evaluatePrice(item.label, itemCatalog, craftCatalog, priceMemo);
            finalCosts.set(item.label, createItem(item.label, minPrice));
        });

        const targetQuery = getNextLine();
        const resultItem = finalCosts.get(targetQuery);

        console.log(resultItem.value);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
