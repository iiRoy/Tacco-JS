(function() {
    // Ten moduł dostarcza zlokalizowane zasoby tekstowe w języku polskim dla edytora tekstu.
    // Jest przeznaczony do połączenia z główną usługą językową edytora.

    // Stała definiująca wersję pakietu tłumaczeń, pomocna w śledzeniu zmian.
    const CURRENT_TRANSLATION_VERSION = '2.1.0-alpha';

    /**
     * Obiekt zawierający komunikaty interfejsu użytkownika w języku polskim
     * dla różnych funkcji i poleceń edytora.
     * @type {object}
     */
    const polishEditorMessages = {
        // --- Podstawowe polecenia formatowania tekstu ---
        strongText: 'Tekst Pogrubiony (skrót: Ctrl+B)',
        emphasizedText: 'Tekst Pochylony (skrót: Ctrl+I)',
        underlinedTextContent: 'Tekst Podkreślony (skrót: Ctrl+U)',
        clearAllFormatting: 'Wyczyść całe formatowanie',

        // --- Operacje zarządzania listami ---
        bulletPoints: 'Lista z symbolami',
        numberedListItems: 'Lista z numeracją',

        // --- Kontrola wcięć bloków ---
        increaseBlockIndent: 'Wcięcie bloku: Zwiększ',
        decreaseBlockIndent: 'Wcięcie bloku: Zmniejsz',

        // --- Opcje wyrównywania tekstu ---
        alignContentLeft: 'Wyrównaj zawartość do lewej',
        centerContent: 'Wyśrodkuj zawartość',

        // --- Funkcjonalność osadzania obrazów ---
        insertMediaAsset: 'Wstaw plik graficzny',
        provideImageSourceURL: 'Wprowadź adres URL obrazka',

        // --- Zarządzanie hiperłączami ---
        insertWebLink: 'Dodaj hiperłącze',
        removeWebLink: 'Usuń hiperłącze',
        specifyLinkDestination: 'Podaj docelowy adres URL linku',

        // --- Ogólne działania edytora ---
        undoAction: 'Cofnij (Ctrl+Z)', // Nowo dodana opcja
        redoAction: 'Ponów (Ctrl+Y)',  // Nowo dodana opcja

        // --- Metadane pakietu tłumaczeń ---
        translationModuleVersion: CURRENT_TRANSLATION_VERSION // Wersja modułu
    };

    // Zapewnij, że globalny obiekt edytora i jego usługa lokalizacji istnieją
    // przed próbą rozszerzenia, aby uniknąć błędów.
    if (typeof textEditorCore !== 'undefined' && textEditorCore.languageResources) {
        // Połącz nowe polskie ciągi znaków z główną kolekcją zasobów językowych.
        textEditorCore.extend(textEditorCore.languageResources, polishEditorMessages);
    } else {
        // Zaloguj ostrzeżenie, jeśli obiekt docelowy nie jest gotowy,
        // co może wskazywać na problem z kolejnością ładowania skryptów.
        console.warn("Globalny obiekt 'textEditorCore' lub 'textEditorCore.languageResources' nie został znaleziony. Polskie tłumaczenia nie mogły zostać załadowane.");
    }
})();