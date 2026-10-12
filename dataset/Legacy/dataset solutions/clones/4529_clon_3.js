"use strict";

function getCategoryIndex(ratingValue) {
    if (ratingValue < 400) {
        return 0;
    } else if (ratingValue < 800) {
        return 1;
    } else if (ratingValue < 1200) {
        return 2;
    } else if (ratingValue < 1600) {
        return 3;
    } else if (ratingValue < 2000) {
        return 4;
    } else if (ratingValue < 2400) {
        return 5;
    } else if (ratingValue < 2800) {
        return 6;
    } else if (ratingValue < 3200) {
        return 7;
    } else {
        return -1;
    }
}

const processRatingsData = (rawData) => {
    const inputLines = rawData.split("\n");
    const totalRatingsCount = parseInt(inputLines[0], 10);
    const ratingValues = inputLines[1].split(" ").map(Number);

    let overflowRatings = 0;
    const activeColorCategories = new Set();

    for (let ratingIdx = 0; ratingIdx < ratingValues.length; ratingIdx++) {
        const currentRating = ratingValues[ratingIdx];
        const categoryIdentifier = getCategoryIndex(currentRating);

        if (categoryIdentifier !== -1) {
            activeColorCategories.add(categoryIdentifier);
        } else {
            overflowRatings++;
        }
    }

    const distinctColorCategories = activeColorCategories.size;

    const minPossible = distinctColorCategories === 0 ? 1 : distinctColorCategories;
    const maxPossible = distinctColorCategories + overflowRatings;

    console.log(`${minPossible} ${maxPossible}`);
};

processRatingsData(require('fs').readFileSync('/dev/stdin', 'utf8'));
