const transformationRules = [
    {
        matcher: /^https?:\/\/gist\.github\.com\/(?:\w+\/)?([a-f0-9]+)$/,
        pathConstructor: (match) => match[1]
    },
    {
        matcher: /^https:\/\/(github\.com\/.*\/)blob\/(.*\.ipynb)$/,
        pathConstructor: (match) => 'urls/raw.' + match[1] + match[2]
    },
    {
        matcher: /^https:\/\/(.*\.ipynb)$/,
        pathConstructor: (match) => 'urls/' + match[1]
    },
    {
        matcher: /^http:\/\/(.*\.ipynb)$/,
        pathConstructor: (match) => 'url/' + match[1]
    }
];

const basePathLink = 'http://nbviewer.ipython.org/';
const currentWebAddress = location.href;
let generatedDestination = null;
const uniqueWindowIdentifier = 'nbv' + Date.now().toString(36);

const applicableRule = transformationRules.find(rule => rule.matcher.test(currentWebAddress));

if (applicableRule) {
    const matchResult = applicableRule.matcher.exec(currentWebAddress);
    if (matchResult) {
        generatedDestination = basePathLink + applicableRule.pathConstructor(matchResult);
    }
}

if (generatedDestination) {
    window.open(generatedDestination, uniqueWindowIdentifier);
}