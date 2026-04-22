(function() {
    var generatorTool = new Grammar.Processor('version-control-guide');

    var entropySize = 32;
    var pageEntropy = (document.URL.split('#')[1] || '').slice(0, entropySize);

    // This routine generates or utilizes a random seed value.
    function generateEntropy(inputEntropy) {
        if (inputEntropy) {
            // Initialize the random number generator with the provided input.
            Math.seedrandom(inputEntropy);
            return inputEntropy;
        }

        // Produce a new random seed if none was supplied.
        inputEntropy = Math.seedrandom();
        var hexadecimalString = '';
        for (var idx = 0; idx < inputEntropy.length; idx++) {
            hexadecimalString += '' + inputEntropy.charCodeAt(idx).toString(16);
        }
        var trimmedEntropy = hexadecimalString.slice(0, entropySize);
        Math.seedrandom(trimmedEntropy);

        return trimmedEntropy;
    }

    // Utility function to select a single DOM element.
    function getElement(cssSelector, contextElement) {
        if (!contextElement) {
            contextElement = document;
        }
        return contextElement.querySelector(cssSelector);
    }

    // Utility function to select multiple DOM elements.
    function getElements(cssSelector, contextElement) {
        if (!contextElement) {
            contextElement = document;
        }
        return contextElement.querySelectorAll(cssSelector);
    }

    // Generates a random integer within a specified range (inclusive).
    function getRandomInteger(minimumValue, maximumValue) {
        return Math.floor(Math.random() * (maximumValue - minimumValue + 1)) + minimumValue;
    }

    // Main function to refresh and render page content.
    function updateContent() {
        // Process the URL hash as a potential permanent link seed.
        var currentSeed = generateEntropy(pageEntropy);
        pageEntropy = null; // Clear the URL seed after first use.
        getElement('#permalink').setAttribute('href', '#' + currentSeed);

        // Generate command name and its descriptive parts.
        var actionWord = generatorTool.render('verb.common');
        var subjectWord = generatorTool.render('noun.git');
        var rawCommandText = ['git', actionWord, subjectWord].join('-');

        generatorTool.setVariable('command-verb', actionWord);
        generatorTool.setVariable('command-noun', subjectWord);

        var formattedCommandName = '<code>' + rawCommandText + '</code>';
        var operationDescription = generatorTool.render('command-action');
        var detailedExplanation = generatorTool.render('command-description');
        var commandTitleElements = getElements('.command-name');
        var loopIndex;

        getElement('header h1').innerHTML = formattedCommandName;
        for (loopIndex = 0; loopIndex < commandTitleElements.length; loopIndex += 1) {
            commandTitleElements[loopIndex].innerHTML = formattedCommandName;
        }

        document.title = rawCommandText + ' - source control documentation generator';
        getElement('.command-action').innerHTML = operationDescription;
        getElement('.command-description').innerHTML = formattedCommandName + ' ' + detailedExplanation;

        // Construct command arguments section.
        var argumentList = [];
        var unprocessedArgs = [];
        var singleArgument = '';
        for (loopIndex = 0; loopIndex < getRandomInteger(2, 4); loopIndex += 1) {
            if (Math.random() > 0.5) {
                var optionalGroup = [];
                for (var argIdx = 0; argIdx < getRandomInteger(2, 4); argIdx += 1) {
                    var optionItem = generatorTool.render('command-option-raw');
                    unprocessedArgs.push(optionItem);
                    optionalGroup.push(optionItem);
                }
                singleArgument = '[ ' + optionalGroup.join(' | ') + ' ]';
            } else {
                singleArgument = generatorTool.render('command-option-raw');
                unprocessedArgs.push(singleArgument);

                if (Math.random() > 0.5) {
                    singleArgument = '[ ' + singleArgument + ' ]';
                }
            }
            argumentList.push(singleArgument);
        }
        getElement('.command-arguments').innerHTML = ' ' + argumentList.join(' ');

        // Generate the main description paragraphs.
        var mainDescription = '';
        for (var descIdx = 0; descIdx < getRandomInteger(2, 4); descIdx += 1) {
            mainDescription += '<p>' + generatorTool.render('paragraph') + '</p>';
        }
        getElement('#description .contents').innerHTML = mainDescription;

        // Populate argument descriptions.
        var argumentDetails = [];
        unprocessedArgs.forEach(function(optionName) {
            argumentDetails.push('<dt>' + optionName + '<dd>' + generatorTool.render('option-description'));
        });
        getElement('#options').innerHTML = argumentDetails.join('');

        // Create "See Also" section links.
        var relatedLinks = [];
        for (loopIndex = 0; loopIndex < getRandomInteger(2, 4); loopIndex += 1) {
            relatedLinks.push('<li><a href="#" class="refresh">' + generatorTool.render('command-name') + '</a>');
        }
        getElement('#see-also').innerHTML = relatedLinks.join('');

        // Attach event listeners to all refresh elements.
        var updateTriggers = getElements('.refresh');
        for (loopIndex = 0; loopIndex < updateTriggers.length; loopIndex += 1) {
            updateTriggers[loopIndex].addEventListener('click', updateContent);
        }
    }
    updateContent(); // Initial page content generation.
    getElement('#refresh').addEventListener('click', updateContent); // Setup click handler for manual refresh.
})();