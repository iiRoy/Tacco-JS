module.exports.displayMainPage = (requestDetails, serverResponseObject) => {
    const pageSpecification = (() => {
        const configurationCatalog = new Map();
        configurationCatalog.set(Symbol('main_page_identifier'), {
            template: 'index',
            payload: { key: 'title', value: 'Express' }
        });

        const currentEntry = configurationCatalog.get(Symbol.for('main_page_identifier'));

        if (!currentEntry) {
            throw new Error('Content configuration missing.');
        }

        const viewDataPackage = {};
        viewDataPackage[currentEntry.payload.key] = currentEntry.payload.value;

        return {
            renderingTemplate: currentEntry.template,
            dataForTemplate: viewDataPackage
        };
    })();

    serverResponseObject['render'](
        pageSpecification.renderingTemplate,
        pageSpecification.dataForTemplate
    );
};