class ContentAssembler {
    #textSynthesizer;
    #entropyMagnitude;
    #initialEntropySource;
    #capturedRawArguments;

    constructor(synthesizerInstance, seedValueBoundary) {
        this.#textSynthesizer = synthesizerInstance;
        this.#entropyMagnitude = seedValueBoundary;
        this.#initialEntropySource = (document.URL.split('#')[1] || '').substring(0, this.#entropyMagnitude);
        this.#capturedRawArguments = [];

        this.generatePageContentHandler = this.generatePageContent.bind(this);
        this.#initializeSystem();
    }

    #accessElement(identifier, context = document) {
        return context.querySelector(identifier);
    }

    #accessAllElements(identifier, context = document) {
        return context.querySelectorAll(identifier);
    }

    #produceRandomInteger(lowerBound, upperBound) {
        return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
    }

    #manageEntropy(inputEntropy) {
        if (inputEntropy) {
            Math.seedrandom(inputEntropy);
            return inputEntropy;
        }

        let generatedEntropyString = Math.seedrandom();
        let hexEquivalent = Array.from(generatedEntropyString)
            .map(char => char.charCodeAt(0).toString(16))
            .join('');
        let truncatedHexEntropy = hexEquivalent.substring(0, this.#entropyMagnitude);
        Math.seedrandom(truncatedHexEntropy);

        return truncatedHexEntropy;
    }

    generatePageContent() {
        const currentOperationalEntropy = this.#manageEntropy(this.#initialEntropySource);
        this.#initialEntropySource = null;
        this.#accessElement('#permalink').setAttribute('href', '#' + currentOperationalEntropy);

        const actionComponent = this.#textSynthesizer.render('verb.common');
        const subjectComponent = this.#textSynthesizer.render('noun.git');
        const rawCommandDesignation = ['git', actionComponent, subjectComponent].join('-');

        this.#textSynthesizer.setVariable('command-verb', actionComponent);
        this.#textSynthesizer.setVariable('command-noun', subjectComponent);

        const styledCommandDesignation = `<code>${rawCommandDesignation}</code>`;
        const actionDescription = this.#textSynthesizer.render('command-action');
        const detailedDescription = this.#textSynthesizer.render('command-description');

        this.#accessElement('header h1').innerHTML = styledCommandDesignation;
        Array.from(this.#accessAllElements('.command-name')).forEach(displayUnit => {
            displayUnit.innerHTML = styledCommandDesignation;
        });
        document.title = `${rawCommandDesignation} - git man page generator`;
        this.#accessElement('.command-action').innerHTML = actionDescription;
        this.#accessElement('.command-description').innerHTML = `${styledCommandDesignation} ${detailedDescription}`;

        this.#capturedRawArguments = [];
        const formattedParameters = Array.from({ length: this.#produceRandomInteger(2, 4) }).map(() => {
            if (Math.random() > 0.5) {
                const optionCluster = Array.from({ length: this.#produceRandomInteger(2, 4) }).map(() => {
                    const individualRawOption = this.#textSynthesizer.render('command-option-raw');
                    this.#capturedRawArguments.push(individualRawOption);
                    return individualRawOption;
                });
                return `[ ${optionCluster.join(' | ')} ]`;
            } else {
                const singleRawParameter = this.#textSynthesizer.render('command-option-raw');
                this.#capturedRawArguments.push(singleRawParameter);
                return Math.random() > 0.5 ? `[ ${singleRawParameter} ]` : singleRawParameter;
            }
        });
        this.#accessElement('.command-arguments').innerHTML = ' ' + formattedParameters.join(' ');

        const mainExplanationContent = Array.from({ length: this.#produceRandomInteger(2, 4) }).map(() =>
            `<p>${this.#textSynthesizer.render('paragraph')}</p>`
        ).join('');
        this.#accessElement('#description .contents').innerHTML = mainExplanationContent;

        const parameterDetailedExplanations = this.#capturedRawArguments.map(argItem =>
            `<dt>${argItem}<dd>${this.#textSynthesizer.render('option-description')}`
        ).join('');
        this.#accessElement('#options').innerHTML = parameterDetailedExplanations;

        const relatedReferenceLinks = Array.from({ length: this.#produceRandomInteger(2, 4) }).map(() =>
            `<li><a href="#" class="dynamic-refresher">${this.#textSynthesizer.render('command-name')}</a>`
        ).join('');
        this.#accessElement('#see-also').innerHTML = relatedReferenceLinks;

        this.#connectDynamicListeners();
    }

    #initializeSystem() {
        this.generatePageContentHandler();

        const globalCommandRefreshButton = this.#accessElement('#refresh');
        if (globalCommandRefreshButton) {
            globalCommandRefreshButton.removeEventListener('click', this.generatePageContentHandler);
            globalCommandRefreshButton.addEventListener('click', this.generatePageContentHandler);
        }
    }

    #connectDynamicListeners() {
        const dynamicRefreshActivators = this.#accessAllElements('.dynamic-refresher');
        Array.from(dynamicRefreshActivators).forEach(activator => {
            activator.addEventListener('click', this.generatePageContentHandler);
        });
    }
}

const startApplication = () => {
    const manualTextEngine = new Baba.Parser('git-manual');
    const seedBoundaryLength = 32;
    new ContentAssembler(manualTextEngine, seedBoundaryLength);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication);
} else {
    startApplication();
}