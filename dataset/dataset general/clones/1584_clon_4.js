class ElementAssembler {
    constructor(baseTagDescriptor) {
        this.constructionPlan = {
            elementKind: '',
            elementId: null,
            styleUnitClasses: [],
            attributeMap: {},
            childComponents: []
        };
        this.tempSelectorId = null;
        this.tempSelectorClasses = [];
        this.analyzeBaseTag(baseTagDescriptor);
        this.finalizedNode = null;
    }

    analyzeBaseTag(descriptorString) {
        const tagMatch = descriptorString.match(/^([a-zA-Z0-9]+)(.*)/);
        if (!tagMatch) {
            throw new Error('Invalid element descriptor format.');
        }
        this.constructionPlan.elementKind = tagMatch[1];
        const selectorFragment = tagMatch[2];

        const idSegments = [...selectorFragment.matchAll(/#([a-zA-Z0-9_-]+)/g)];
        if (idSegments.length > 0) {
            this.tempSelectorId = idSegments[idSegments.length - 1][1];
        }
        const classSegments = [...selectorFragment.matchAll(/\.([a-zA-Z0-9_-]+)/g)];
        if (classSegments.length > 0) {
            this.tempSelectorClasses.push(...classSegments.map(m => m[1]));
        }
    }

    applyConfiguration(configProperties) {
        if (!configProperties) return this;
        Object.keys(configProperties).forEach(key => {
            if (key === 'id') {
                this.constructionPlan.elementId = (this.constructionPlan.elementId ? this.constructionPlan.elementId + ' ' : '') + configProperties[key];
            } else if (key === 'class' || key === 'className') {
                this.constructionPlan.styleUnitClasses.push(...configProperties[key].split(' ').filter(c => c));
            } else {
                this.constructionPlan.attributeMap[key] = configProperties[key];
            }
        });
        return this;
    }

    finalizeConfiguration() {
        if (this.tempSelectorId) {
            this.constructionPlan.elementId = (this.constructionPlan.elementId ? this.constructionPlan.elementId + ' ' : '') + this.tempSelectorId;
        }
        if (this.tempSelectorClasses.length > 0) {
            this.constructionPlan.styleUnitClasses.push(...this.tempSelectorClasses);
        }
        this.constructionPlan.styleUnitClasses = Array.from(new Set(this.constructionPlan.styleUnitClasses));
        return this;
    }

    injectContent(contentItems) {
        if (contentItems === null || contentItems === undefined) return this;
        const normalizedContent = Array.isArray(contentItems) ? contentItems : [contentItems];
        this.constructionPlan.childComponents.push(...normalizedContent);
        return this;
    }

    // This method creates and returns the actual DOM element
    render() {
        this.finalizedNode = document.createElement(this.constructionPlan.elementKind);

        if (this.constructionPlan.elementId) {
            this.finalizedNode.id = this.constructionPlan.elementId;
        }

        if (this.constructionPlan.styleUnitClasses.length > 0) {
            this.finalizedNode.className = this.constructionPlan.styleUnitClasses.join(' ');
        }

        Object.entries(this.constructionPlan.attributeMap).forEach(([key, value]) => {
            this.finalizedNode.setAttribute(key, value);
        });

        const processElementChild = (sourceItem) => {
            if (sourceItem instanceof HTMLElement || sourceItem instanceof Text) {
                this.finalizedNode.appendChild(sourceItem);
            } else if (typeof sourceItem === 'string' || typeof sourceItem === 'number') {
                this.finalizedNode.appendChild(document.createTextNode(String(sourceItem)));
            } else if (typeof sourceItem === 'function') {
                if (sourceItem.length === 1) {
                    sourceItem((asyncResult) => {
                        processElementChild(asyncResult);
                    });
                } else {
                    const syncResult = sourceItem();
                    processElementChild(syncResult);
                }
            } else if (Array.isArray(sourceItem)) {
                sourceItem.forEach(item => processElementChild(item));
            }
        };

        this.constructionPlan.childComponents.forEach(processElementChild);

        return this.finalizedNode;
    }
}

const constructVisual = (...args) => {
    let assemblerInstance;
    let elementConfig = null;
    let elementContent = null;

    const [descriptorInput, secondInput, thirdInput] = args;

    assemblerInstance = new ElementAssembler(descriptorInput);

    if (secondInput !== undefined) {
        const isConfigObject = typeof secondInput === 'object' && secondInput !== null && !Array.isArray(secondInput) && !(secondInput instanceof HTMLElement || secondInput instanceof Text) && typeof secondInput !== 'function';

        if (isConfigObject) {
            elementConfig = secondInput;
            elementContent = thirdInput;
        } else {
            elementContent = secondInput;
        }
    }

    assemblerInstance.applyConfiguration(elementConfig);
    assemblerInstance.finalizeConfiguration();
    assemblerInstance.injectContent(elementContent);

    return assemblerInstance.render();
};