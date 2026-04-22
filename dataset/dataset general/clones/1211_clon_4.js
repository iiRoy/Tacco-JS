(function(applicationHost, resourceNamespace) {
    const termMappings = [
        ['bold', 'Pogrubienie (Ctrl+B)'],
        ['italic', 'Kursywa (Ctrl+I)'],
        ['underline', 'Podkreślenie (Ctrl+U)'],
        ['strike', 'Przekreślenie'],
        ['ul', 'Lista wypunktowana'],
        ['ol', 'Lista numerowana'],
        ['indent', 'Zwiększ wcięcie'],
        ['outdent', 'Zmniejsz wcięcie'],
        ['left', 'Wyrównanie do lewej'],
        ['center', 'Wyśrodkowanie'],
        ['right', 'Wyrównanie do prawej'],
        ['style', 'Styl tekstu'],
        ['removeformat', 'Usuń formatowanie'],
        ['insertimage', 'Załącz obraz'],
        ['entersrc', 'Podaj URL obrazka'],
        ['link', 'Załącz odnośnik'],
        ['unlink', 'Rozłącz odnośnik'],
        ['enterhref', 'Podaj URL odnośnika'],
        ['textcolor', 'Kolor tekstu']
    ];

    let targetDictionary = applicationHost[resourceNamespace];
    if (!targetDictionary) {
        targetDictionary = {};
        applicationHost[resourceNamespace] = targetDictionary;
    }

    let currentItemIndex = 0;
    while (currentItemIndex < termMappings.length) {
        const currentPair = termMappings[currentItemIndex];
        targetDictionary[currentPair[0]] = currentPair[1];
        currentItemIndex++;
    }
})(punymce, 'I18n');