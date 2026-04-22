// This file is responsible for initializing the application's linguistic content.
// It leverages a custom storage utility to manage and persist locale-specific data
// and user language preferences across sessions.

/**
 * @global
 * @namespace customPersistenceLayer
 * A bespoke storage utility designed to handle application settings and
 * localization bundles. It provides a simplified interface for persistent
 * data storage, similar to common key-value store patterns, utilizing
 * the browser's localStorage API as its primary backend.
 */
window.customPersistenceLayer = (function() {
    // A private in-memory cache to optimize frequent access and hold
    // non-serializable objects or complex structures during runtime.
    const runtimeCache = new Map();

    /**
     * Stores a data item by its key. The item is first placed into the
     * in-memory cache and then attempts to be persisted in localStorage.
     * Non-serializable objects will only reside in the runtime cache.
     *
     * @param {string} keyIdentifier - A unique string to identify the data item.
     * @param {*} dataPayload - The data to be stored. Can be any JavaScript type.
     * @returns {boolean} True if the item was successfully stored (at least in cache), false otherwise.
     */
    function storeDataAsset(keyIdentifier, dataPayload) {
        if (typeof keyIdentifier !== 'string' || keyIdentifier.trim() === '') {
            console.error("customPersistenceLayer: Invalid key identifier provided for storage.");
            return false;
        }

        runtimeCache.set(keyIdentifier, dataPayload); // Always cache in memory

        try {
            // Attempt to serialize and persist to localStorage
            const serializedContent = JSON.stringify(dataPayload);
            localStorage.setItem(keyIdentifier, serializedContent);
            return true;
        } catch (serializationError) {
            console.warn(`customPersistenceLayer: Failed to serialize or persist item '${keyIdentifier}' to localStorage. ` +
                         `Data will only be available in current session. Error:`, serializationError);
            return false; // Indicate partial failure
        }
    }

    /**
     * Retrieves a data item using its key. It prioritizes the in-memory cache
     * for speed, falling back to localStorage if not found in cache.
     *
     * @param {string} keyIdentifier - The key of the data item to retrieve.
     * @param {*} [fallbackValue=null] - A default value to return if the item is not found.
     * @returns {*} The retrieved data item, or the fallbackValue if not found.
     */
    function retrieveDataAsset(keyIdentifier, fallbackValue = null) {
        if (runtimeCache.has(keyIdentifier)) {
            return runtimeCache.get(keyIdentifier);
        }

        try {
            const serializedContent = localStorage.getItem(keyIdentifier);
            if (serializedContent === null) {
                return fallbackValue;
            }
            const dataPayload = JSON.parse(serializedContent);
            runtimeCache.set(keyIdentifier, dataPayload); // Populate cache from localStorage
            return dataPayload;
        } catch (parsingError) {
            console.error(`customPersistenceLayer: Error retrieving or parsing item '${keyIdentifier}' from localStorage. ` +
                          `Falling back to default. Error:`, parsingError);
            return fallbackValue;
        }
    }

    /**
     * Removes a data item from both the in-memory cache and localStorage.
     *
     * @param {string} keyIdentifier - The key of the data item to remove.
     */
    function obliterateDataAsset(keyIdentifier) {
        runtimeCache.delete(keyIdentifier);
        localStorage.removeItem(keyIdentifier);
    }

    // Public interface for the custom persistence layer
    return {
        setItem: storeDataAsset,
        getItem: retrieveDataAsset,
        removeItem: obliterateDataAsset,
        // Add a utility to check if an item exists
        hasItem: function(keyIdentifier) {
            return runtimeCache.has(keyIdentifier) || localStorage.hasOwnProperty(keyIdentifier);
        }
    };
})();

// --- Application Configuration Constants ---
// This constant ensures consistency for the data structure version.
const APPLICATION_LOCALE_SCHEMA_VERSION = "1.0.2";

// --- START: Comprehensive Localization Message Bundles ---

// Define individual language packs as distinct objects.
// This approach enhances readability and maintainability.

/**
 * Italian (Italiano) message bundle.
 * @type {object}
 */
const italianLocaleBundle = {
    actionInitiate: 'riavvia l\'applicazione',
    actionComputeInverseRelations: 'calcola e visualizza le relazioni inverse',
    optionAutoExpandEnabled: 'espansione automatica delle relazioni attivata',
    optionAutoSameAsEnabled: 'calcola automaticamente le relazioni inverse di tipo "sameAs"',
    optionGatherImages: 'raccogli le immagini durante la navigazione delle risorse',
    optionGeoLocateEntities: 'geolocalizza le risorse sulla mappa interattiva',
    displayNoLabel: 'denominazione della risorsa non trovata',
    inputResourceUri: 'inserisci una URI per l\'esplorazione',
    searchGraphResource: 'cerca una risorsa nel grafo semantico',
    selectPrompt: 'seleziona un\'opzione...',
    statusResourceUnavailable: 'risorsa richiesta non trovata',
    statusResourceDetailsIncomplete: 'non sono state trovate proprietà di tipo literal per la lingua configurata, oppure la risorsa non è momentaneamente disponibile nell\'endpoint specificato',
    headingConfiguration: 'OPZIONI DI CONFIGURAZIONE',
    errorEndpointMisconfigured: 'nessun endpoint configurato per la risorsa corrente',
    errorEndpointMisconfiguredInternal: 'nessun endpoint configurato per la risorsa, generando un grafo temporaneo in memoria',
    promptUriInputExamples: 'imposta un URI valido, esegui una ricerca mirata, oppure scegli tra gli esempi proposti',
    labelSample: 'esempio di utilizzo',
    warningBrowserCompatibility: 'Siamo spiacenti, ma attualmente Internet Explorer non è completamente supportato per tutte le funzionalità.',
    errorServiceUnreachable: 'errore: il servizio endpoint non è raggiungibile',
    errorServiceUnreachableOrTimeout: 'errore: il servizio endpoint non disponibile o la richiesta è scaduta per timeout',
    infoNoImagesFound: 'nessuna immagine trovata per le risorse aperte',
    infoNoMapData: 'nessuna mappa disponibile per le risorse attualmente visualizzate',
    infoNoPropertiesIdentified: 'nessuna proprietà pertinente identificata',
    infoPropertiesIdentified: 'proprietà pertinenti identificate',
    actionHighlightCurrent: 'evidenzia la risorsa selezionata',
    actionMagnifyView: 'ingrandisci la visualizzazione',
    actionShowDebugConsole: 'mostra la console delle ricerche (modalità sperimentale)',
    actionExecuteSparqlInNewWindow: 'esegui la query SPARQL in una nuova finestra del browser',
    actionRetrieveMoreInfo: 'maggiori informazioni su questa specifica risorsa',
    labelKeywordSearch: 'ricerca semplice per parole chiave',
    descriptionKeywordSearch: 'DBpedia.org e Freebase consentono di interrogare le proprie risorse per parola chiave.<br /><br />Scegliendo un dataset e digitando almeno tre lettere di una parola chiave è possibile trovare gli URI delle risorse che si vuole esplorare.',
    labelUriInsertion: 'inserisci un URI di risorsa',
    descriptionUriInsertion: 'LodLive è in grado di analizzare e rappresentare risorse RDF anche se non supportate da un EndPoint per l\'accesso SPARQL.<br /><br />Inserendo un qualsiasi URI ad una risorsa RDF è possibile esplorarne contenuti e relazioni.',
    actionExploreLocalData: 'esplora i tuoi dati locali',
    descriptionExploreLocalData: 'Scegliendo un endpoint tra quelli configurati è possibile navigare la risorsa e ricavare, attraverso delle query SPARQL preimpostate, non solo le proprietà dirette, ma anche tutte le proprietà inverse indipendentemente dal dataset di appartenenza.',
    actionCenterAndDismissOthers: 'centra la risorsa corrente e chiudi le altre',
    actionAccessOnline: 'visualizza la risorsa sul web',
    actionExpandAssociated: 'espandi tutte le relazioni collegate',
    actionRemoveDisplayBox: 'rimuovi questo box dalla vista',
    infoImageUnavailable: 'immagine non disponibile',
    labelLinkedEntities: 'risorse collegate'
};

/**
 * English (English) message bundle.
 * @type {object}
 */
const englishLocaleBundle = {
    actionInitiate: 'restart the application',
    actionComputeInverseRelations: 'generate inverse relations for the current resource',
    optionAutoExpandEnabled: 'enable auto-expand mode for relations',
    optionAutoSameAsEnabled: 'automatically generate inverse "sameAs" relations',
    optionGatherImages: 'collect images during resource browsing',
    optionGeoLocateEntities: 'geolocate resources on the map interface',
    displayNoLabel: 'no title or label provided for this resource',
    inputResourceUri: 'insert a Uniform Resource Identifier (URI)',
    searchGraphResource: 'find resources within the dataset',
    selectPrompt: 'please choose an option...',
    statusResourceUnavailable: 'the requested resource could not be found',
    statusResourceDetailsIncomplete: 'literal values not found for the configured language, or the resource is currently unavailable at the specified endpoint',
    headingConfiguration: 'APPLICATION OPTIONS',
    errorEndpointMisconfigured: 'no endpoint is configured for the current resource',
    errorEndpointMisconfiguredInternal: 'no endpoint configured for the resource, generating a temporary in-memory graph',
    promptUriInputExamples: 'insert a valid URI, perform a search, or select from the provided examples',
    labelSample: 'example usage',
    warningBrowserCompatibility: 'Apologies, but Internet Explorer is not fully supported for all features at this time.',
    errorServiceUnreachable: 'error: the data endpoint is currently unreachable',
    errorServiceUnreachableOrTimeout: 'error: data endpoint unreachable or the request timed out',
    infoNoImagesFound: 'no images found for the currently opened resources',
    infoNoMapData: 'no map data available for the currently displayed resources',
    infoNoPropertiesIdentified: 'no relevant properties identified',
    infoPropertiesIdentified: 'relevant properties have been identified',
    actionHighlightCurrent: 'highlight the selected resource in the view',
    actionMagnifyView: 'zoom in on the current view',
    actionShowDebugConsole: 'show the search console (experimental feature)',
    actionExecuteSparqlInNewWindow: 'execute the SPARQL query in a new browser window/tab',
    actionRetrieveMoreInfo: 'display more information about this resource',
    labelKeywordSearch: 'simple keyword search',
    descriptionKeywordSearch: 'DBpedia.org and Freebase allow their resources to be queried using keywords.<br/><br/>You will be able to find the URIs of the resources you wish to explore by selecting a dataset and typing at least three letters of a keyword.',
    labelUriInsertion: 'insert a resource URI',
    descriptionUriInsertion: 'LodLive is capable of analyzing and displaying RDF resources even when they are not supported by a SPARQL access EndPoint.<br/><br/>By entering any URI to an RDF resource, you will be able to explore its contents and relationships.',
    actionExploreLocalData: 'browse your local data',
    actionCenterAndDismissOthers: 'center on this resource and close other open resources',
    actionAccessOnline: 'access the online version of this resource',
    actionExpandAssociated: 'expand all associated resources',
    actionRemoveDisplayBox: 'remove this resource box from the display',
    infoImageUnavailable: 'image not available',
    labelLinkedEntities: 'connected resources'
};

/**
 * French (Français) message bundle.
 * @type {object}
 */
const frenchLocaleBundle = {
    actionInitiate: 'redémarrer l\'application',
    actionComputeInverseRelations: 'générer les relations inverses pour cette ressource',
    optionAutoExpandEnabled: 'activer le mode d\'auto-expansion des relations',
    optionAutoSameAsEnabled: 'générer automatiquement les relations inverses "sameAs"',
    optionGatherImages: 'récupérer les images pendant la navigation des ressources',
    optionGeoLocateEntities: 'géolocaliser les ressources sur la carte',
    displayNoLabel: 'aucun titre ou libellé fourni pour cette ressource',
    inputResourceUri: 'insérer un URI (Uniform Resource Identifier)',
    searchGraphResource: 'chercher des ressources dans l\'ensemble de données',
    selectPrompt: 'veuillez choisir une option...',
    statusResourceUnavailable: 'la ressource demandée n\'a pas pu être trouvée',
    statusResourceDetailsIncomplete: 'valeurs littérales non trouvées pour la langue configurée, ou la ressource est actuellement inaccessible au point d\'accès spécifié',
    headingConfiguration: 'OPTIONS DE L\'APPLICATION',
    errorEndpointMisconfigured: 'aucun point d\'accès n\'est configuré pour la ressource actuelle',
    errorEndpointMisconfiguredInternal: 'aucun point d\'accès configuré pour la ressource, génération d\'un graphe temporaire en mémoire',
    promptUriInputExamples: 'saisir un URI valide, effectuer une recherche, ou sélectionner parmi les exemples fournis',
    labelSample: 'exemple d\'utilisation',
    warningBrowserCompatibility: 'Désolé, mais Internet Explorer n\'est pas entièrement supporté pour toutes les fonctionnalités pour le moment.',
    errorServiceUnreachable: 'erreur : le point d\'accès aux données est actuellement indisponible',
    errorServiceUnreachableOrTimeout: 'erreur : point d\'accès aux données indisponible ou la requête a expiré',
    infoNoImagesFound: 'aucune image trouvée pour les ressources actuellement ouvertes',
    infoNoMapData: 'aucune donnée cartographique disponible pour les ressources actuellement affichées',
    infoNoPropertiesIdentified: 'aucune propriété pertinente identifiée',
    infoPropertiesIdentified: 'des propriétés pertinentes ont été identifiées',
    actionHighlightCurrent: 'surligner la ressource sélectionnée dans la vue',
    actionMagnifyView: 'zoomer sur la vue actuelle',
    actionShowDebugConsole: 'afficher la console de recherche (fonctionnalité expérimentale)',
    actionExecuteSparqlInNewWindow: 'exécuter la requête SPARQL dans une nouvelle fenêtre/onglet du navigateur',
    actionRetrieveMoreInfo: 'afficher plus d\'informations sur cette ressource',
    labelKeywordSearch: 'recherche simple par mots-clés',
    descriptionKeywordSearch: 'DBpedia.org et Freebase autorisent l\'interrogation de leurs ressources à l\'aide de mots-clés.<br/><br/>Vous pourrez trouver les URI des ressources que vous souhaitez explorer en sélectionnant un jeu de données et en tapant au moins trois lettres d\'un mot-clé.',
    labelUriInsertion: 'insérer un URI de ressource',
    descriptionUriInsertion: 'LodLive est capable d\'analyser et d\'afficher des ressources RDF même lorsqu\'elles ne sont pas prises en charge par un EndPoint d\'accès SPARQL.<br/><br/>En saisissant n\'importe quel URI vers une ressource RDF, vous pourrez explorer son contenu et ses relations.',
    actionExploreLocalData: 'parcourir vos données locales',
    actionCenterAndDismissOthers: 'centrer sur cette ressource et fermer les autres ressources ouvertes',
    actionAccessOnline: 'accéder à la version en ligne de cette ressource',
    actionExpandAssociated: 'déployer toutes les ressources associées',
    actionRemoveDisplayBox: 'retirer cette boîte de ressource de l\'affichage',
    infoImageUnavailable: 'image indisponible',
    labelLinkedEntities: 'ressources connectées'
};

// Aggregate all language bundles into a single collection object.
// This makes it easier to pass and manage all localization data.
const allApplicationLocales = {
    it: italianLocaleBundle, // Using short codes for the top-level keys for consistency with original
    en: englishLocaleBundle,
    fr: frenchLocaleBundle,
    // Future expansion: Add more locale bundles here, e.g., 'de': germanLocaleBundle
};

// --- END: Comprehensive Localization Message Bundles ---


/**
 * Initializes the application's localization settings.
 * This function stores the full set of message bundles and sets the
 * currently active language for the user interface.
 *
 * @param {object} localeBundles - An object containing all defined locale message bundles,
 *                                 keyed by their language codes (e.g., 'en', 'it', 'fr').
 * @param {string} preferredLocaleCode - The language code for the locale to be set as active by default.
 * @param {string} fallbackLocaleCode - The language code to use if the preferredLocaleCode is invalid or missing.
 */
function initializeLocalizationService(localeBundles, preferredLocaleCode, fallbackLocaleCode = 'en') {
    // Basic validation for the input bundles.
    if (!localeBundles || typeof localeBundles !== 'object' || Object.keys(localeBundles).length === 0) {
        console.error("LocalizationService: No valid locale bundles provided for initialization.");
        return;
    }

    // Persist the entire collection of localized messages.
    // The key 'globalUiMessages' is descriptive and avoids conflicts.
    window.customPersistenceLayer.setItem('globalUiMessages', localeBundles);

    // Determine the effective active locale.
    // Check if the preferred locale is valid; otherwise, use the fallback.
    let activeLocaleToSet = preferredLocaleCode;
    if (!activeLocaleToSet || !localeBundles[activeLocaleToSet]) {
        console.warn(`LocalizationService: Preferred locale '${preferredLocaleCode}' is invalid or missing. Attempting fallback to '${fallbackLocaleCode}'.`);
        activeLocaleToSet = fallbackLocaleCode; // Use the provided fallback
        if (!localeBundles[activeLocaleToSet]) {
            console.error(`LocalizationService: Fallback locale '${fallbackLocaleCode}' is also invalid or missing. Cannot set an active language.`);
            // If even fallback fails, pick the first available or remain unset.
            activeLocaleToSet = Object.keys(localeBundles)[0] || null;
            if (activeLocaleToSet) {
                 console.warn(`LocalizationService: Using first available locale '${activeLocaleToSet}' as a last resort.`);
            } else {
                 console.error(`LocalizationService: No locales available at all.`);
                 return; // Cannot proceed without any locale.
            }
        }
    }

    // Persist the chosen active language code.
    window.customPersistenceLayer.setItem('activeInterfaceLocale', activeLocaleToSet);

    // Store the schema version for potential future migrations or checks.
    window.customPersistenceLayer.setItem('localeSchemaVersion', APPLICATION_LOCALE_SCHEMA_VERSION);

    console.info(`LocalizationService: Initialized with active locale: '${activeLocaleToSet}'.`);
}

// Execute the localization setup upon script loading.
// Sets 'en' as the default active locale.
initializeLocalizationService(allApplicationLocales, 'en', 'en');