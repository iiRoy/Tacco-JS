(function (hostLibrary) {
    'use strict';

    const textSupplier = (phrase) => () => phrase;

    hostLibrary.fn.componentAdapter = hostLibrary.fn.componentAdapter || {};
    hostLibrary.fn.componentAdapter.config = hostLibrary.fn.componentAdapter.config || {};

    hostLibrary.fn.componentAdapter.config.filterRemovalDisplay = textSupplier('Odebrat filtry');
    hostLibrary.fn.componentAdapter.config.searchInitiationDisplay = textSupplier('Vyhledat');

    const localizationDefinitions = [
        { category: 'numerical', index: 0, translation: 'Méně než' },
        { category: 'numerical', index: 1, translation: 'Více než' },
        { category: 'numerical', index: 2, translation: 'Je rovno' },
        { category: 'textual', index: 0, translation: 'Je rovno' },
        { category: 'textual', index: 1, translation: 'Není rovno' },
        { category: 'textual', index: 2, translation: 'Obsahuje' },
        { category: 'textual', index: 3, translation: 'Neobsahuje' },
        { category: 'textual', index: 4, translation: 'Je prázdné' },
        { category: 'textual', index: 5, translation: 'Není prázdné' }
    ];

    hostLibrary.fn.componentAdapter.dataSources = hostLibrary.fn.componentAdapter.dataSources || {};
    hostLibrary.fn.componentAdapter.dataSources.numerical = hostLibrary.fn.componentAdapter.dataSources.numerical || {};
    hostLibrary.fn.componentAdapter.dataSources.numerical.items = hostLibrary.fn.componentAdapter.dataSources.numerical.items || [];
    hostLibrary.fn.componentAdapter.dataSources.textual = hostLibrary.fn.componentAdapter.dataSources.textual || {};
    hostLibrary.fn.componentAdapter.dataSources.textual.items = hostLibrary.fn.componentAdapter.dataSources.textual.items || [];

    localizationDefinitions.forEach(itemInfo => {
        let currentSourceItems = hostLibrary.fn.componentAdapter.dataSources[itemInfo.category].items;
        currentSourceItems[itemInfo.index].locale.content = itemInfo.translation;
    });

})(window.jQuery);