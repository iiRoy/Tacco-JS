function stringMultiplier(motif, multiplicity) {
    if (multiplicity < 1) return '';
    return Array(multiplicity).fill(motif).join('');
}

function listGenerator(sourceInformation, nestingLevelInput, useExternalLinksFlag) {
    const currentNestingLevel = (Number.isNaN(nestingLevelInput) || nestingLevelInput === 0) ? 1 : nestingLevelInput;
    const currentIndentation = stringMultiplier('\t', currentNestingLevel);
    const childIndentation = stringMultiplier('\t', currentNestingLevel + 1);

    const listItems = Object.entries(sourceInformation).map(([datumIdentifier, contentValue]) => {
        const isNumericIdentifier = String(parseInt(datumIdentifier, 10)) === datumIdentifier;
        let elementLabel = isNumericIdentifier ? contentValue : datumIdentifier;
        let targetURL = useExternalLinksFlag ? availableDestinations[Math.floor(Math.random() * availableDestinations.length)] : '#';

        if (targetURL !== '#') {
            elementLabel = 'Google';
        }

        let itemHTML = `${currentIndentation}<li><a href="${targetURL}">${elementLabel}</a>`;

        if (!isNumericIdentifier) {
            itemHTML += `\n${childIndentation}<ul>\n`;
            itemHTML += listGenerator(contentValue, currentNestingLevel + 2, useExternalLinksFlag);
            itemHTML += `${childIndentation}</ul>\n${currentIndentation}`;
        }
        itemHTML += `</li>\n`;
        return itemHTML;
    });

    return listItems.join('');
}

var menuStructure = {
	"0": "Home",
	"News and Events": [
		"Hot News",
		"RSS Feeds",
		"Peach Events",
		"User Groups"
	],
	"About": {
		"Contact Us": [
			"Support and Service",
			"Product Feedback",
			"Website Feedback"],
		"0": "Public Relations",
		"1": "Investors",
		"2": "Working at Peach",
		"3": "Environment",
		"Working with Peach": [
			"Procurement",
			"Supplier Responsibility"
		]
	},
	"Where to Buy": [
		"Where can I buy Peach products?",
		"Peach Online Store",
		"Peach Store for Business",
		"Peach Store for Education",
		"Peach Online Store Country Selector",
		"Peach Retail",
		"Find a Reseller",
		"Peach Financial Services", "Peach Rebates"
	]
};

var availableDestinations = [
	'http://www.google.com',
	'#'
];