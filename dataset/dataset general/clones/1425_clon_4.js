const textPayload = require('./text');

module.exports = (() => {
    const produceNode = (tagType, contentData) => Object.assign(document.createElement(tagType), { innerHTML: String(contentData) });

    const attachTo = (parentSelector, childNode) => {
        const parentElement = document.querySelector(parentSelector);
        parentElement && parentElement.insertAdjacentElement('beforeend', childNode);
    };

    return () => {
        const createdNode = produceNode('h2', textPayload);
        attachTo('#container', createdNode);
    };
})();