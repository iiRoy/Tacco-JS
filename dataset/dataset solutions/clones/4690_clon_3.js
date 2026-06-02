function computeDiscountedTotal(rawInputData) {
    const ITEM_BASE_PRICE = 800;
    const DISCOUNT_PER_UNIT_BLOCK = 200;
    const DISCOUNT_BLOCK_SIZE = 15;

    const cleanedInputString = rawInputData.trim();
    const inputSegments = cleanedInputString.split(" ");
    const parsedItemCount = parseInt(inputSegments[0]);

    const baseCostCalculation = ITEM_BASE_PRICE * parsedItemCount;

    const discountEligibilityRatio = parsedItemCount / DISCOUNT_BLOCK_SIZE;
    const numberOfDiscountBlocks = Math.floor(discountEligibilityRatio);

    const totalDiscountValue = DISCOUNT_PER_UNIT_BLOCK * numberOfDiscountBlocks;

    const finalNetCost = baseCostCalculation - totalDiscountValue;

    console.log(finalNetCost);
}

const fileSystemModule = require("fs");
const stdinContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
computeDiscountedTotal(stdinContent);
