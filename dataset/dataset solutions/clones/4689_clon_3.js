function calculateAndDisplayResult(rawInputVal) {
    const ITEM_UNIT_PRICE = 800;
    const DISCOUNT_QUANTITY_THRESHOLD = 15;
    const DISCOUNT_PER_BLOCK = 200;

    let totalBasePrice = rawInputVal * ITEM_UNIT_PRICE;

    let quantityForDiscountCheck = rawInputVal;
    let numberOfDiscountBlocks = Math.floor(quantityForDiscountCheck / DISCOUNT_QUANTITY_THRESHOLD);

    let totalDiscountValue = numberOfDiscountBlocks * DISCOUNT_PER_BLOCK;

    let finalAmount = totalBasePrice - totalDiscountValue;

    console.log(finalAmount);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const rawInputString = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
const numericInput = Number(rawInputString);

calculateAndDisplayResult(numericInput);
