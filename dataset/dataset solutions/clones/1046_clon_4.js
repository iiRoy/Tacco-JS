const sourceText = require('fs').readFileSync(0, 'utf8');
const textLines = sourceText.trim().split('\n');

const [numArticles, numVessels] = textLines[0].split(' ').map(Number);
const articleWeights = textLines.slice(1).map(Number);

const sumOfWeights = articleWeights.reduce((acc, val) => acc + val, 0);
const maxIndividualWeight = Math.max(...articleWeights);

const evaluateCapacity = (articles, cap, vessels, currentLoad) => {
    if (articles.length === 0) {
        return true;
    }
    const currentArticle = articles[0];

    if (currentArticle > cap) {
        return false;
    }

    if (currentLoad + currentArticle > cap) {
        if (vessels <= 1) {
            return false;
        }
        return evaluateCapacity(articles.slice(1), cap, vessels - 1, currentArticle);
    } else {
        return evaluateCapacity(articles.slice(1), cap, vessels, currentLoad + currentArticle);
    }
};

const findOptimalThreshold = (articles, vesselsCount, lowerBound, upperBound) => {
    if (lowerBound === upperBound) {
        return lowerBound;
    }

    const midPoint = Math.floor((lowerBound + upperBound) / 2);

    if (evaluateCapacity(articles, midPoint, vesselsCount, 0)) {
        return findOptimalThreshold(articles, vesselsCount, lowerBound, midPoint);
    } else {
        return findOptimalThreshold(articles, vesselsCount, midPoint + 1, upperBound);
    }
};

const result = findOptimalThreshold(articleWeights, numVessels, maxIndividualWeight, sumOfWeights);
console.log(result);