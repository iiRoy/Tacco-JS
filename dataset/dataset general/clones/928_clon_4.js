const obtainItalianPhrases = () => ({
    beginAgain: 'riavvia',
    makeReverseConnections: 'calcola relazioni inverse',
    autoExpandConnections: 'espandi automaticamente le relazioni',
    autoSameAsRelations: 'calcola relazioni inverse di tipo sameAs',
    gatherImages: 'raccogli le immagini durante la navigazione',
    geoLocateResources: 'geolocalizza le risorse',
    noIdentifier: 'denominazione non trovata',
    inputUri: 'inserisci una uri',
    searchResource: 'cerca una risorsa',
    pickOption: 'scegli...',
    resourceNotFound: 'risorsa non trovata',
    resourceInfoMissing: 'non sono state trovate proprietà di tipo literal per la risorsa per la lingua impostata o la risorsa non è momentaneamente disponibile nell\'endpoint',
    settings: 'OPZIONI',
    endpointNotSet: 'nessun endpoint configurato per la risorsa',
    endpointNotSetInternal: 'nessun endpoint configurato per la risorsa, generazione grafo temporaneo',
    setUriInstructions: 'imposta un uri, esegui una ricerca \no scegli tra gli esempi proposti',
    sample: 'esempio',
    browserWarning: 'Siamo spiacenti ma attualmente Internet Explorer non &egrave; totalmente supportato.',
    endpointIssue: 'errore: endpoint non disponibile',
    endpointTimeout: 'errore: endpoint non disponibile o richiesta scaduta',
    noImagesFound: 'nessuna immagine per le risorse aperte',
    noMapAvailable: 'nessuna mappa per le riorse aperte',
    noProperties: 'nessuna propriet&agrave; trovata',
    propertiesFound: 'propriet&agrave; trovate',
    highlightResource: 'evidenza la risorsa',
    zoomView: 'ingrandisci',
    showDebugConsole: 'mostra la console delle ricerche (sperimentale)',
    executeSparql: 'esegui la query SPARQL in una nuova finestra',
    resourceDetails: 'maggiori informazioni su questa risorsa',
    basicSearch: 'ricerca semplice',
    basicSearchExplanation: 'DBpedia.org e Freebase consentono di interrogare le proprie risorse per parola chiave.<br /><br />Scegliendo un dataset e digitando almeno tre lettere di una parola chiave è possibile trovare gli URI delle risorse che si vuole esplorare.',
    insertResourceUri: 'inserisci un URI',
    insertResourceUriExplanation: 'LodLive è in grado di analizzare e rappresentare risorse RDF anche se non supportate da un EndPoint per l\'accesso SPARQL.<br /><br />Inserendo un qualsiasi URI ad una risorsa RDF è possibile esplorarne contenuti e relazioni.',
    exploreLocalData: 'esplora i tuoi dati',
    liveExploration: 'Scegliendo un endpoint tra quelli configurati è possibile navigare la risorsa e ricavare, attraverso delle query SPARQL preimpostate, non solo le proprietà dirette, ma anche tutte le proprietà inverse indipendentemente dal dataset di appartenenza.',
    centerAndCloseOthers: 'centra e chiudi le altre risorse',
    viewOnline: 'visualizza la risorsa online',
    expandAllRelations: 'espandi tutte le relazioni',
    removeThisBox: 'rimuovi questo box',
    imageUnavailable: 'immagine non disponibile',
    linkedResources: 'risorse collegate'
});

const obtainEnglishPhrases = () => ({
    beginAgain: 'restart',
    makeReverseConnections: 'generate inverse relations',
    autoExpandConnections: 'auto-expand mode',
    autoSameAsRelations: 'generate inverse sameAs relations',
    gatherImages: 'collect images during browsing',
    geoLocateResources: 'geolocalize resources',
    noIdentifier: 'no title provided',
    inputUri: 'insert an URI',
    searchResource: 'find resources',
    pickOption: 'choose...',
    resourceNotFound: 'resource not found',
    resourceInfoMissing: 'literal values not found or the resource is missing or not available in the endpoint',
    settings: 'OPTIONS',
    endpointNotSet: 'no endpoint configured for the resource',
    endpointNotSetInternal: 'no endpoint configured for the resource, generating temporary graph',
    setUriInstructions: 'insert an uri, make a query or choose one of the examples provided',
    sample: 'example',
    browserWarning: 'Sorry but Internet Explorer is not totally supported.',
    endpointIssue: 'error: endpoint not available',
    endpointTimeout: 'error: endpoint not available or the request timed out',
    noImagesFound: 'no images for the opened resources',
    noMapAvailable: 'no maps for the opened resources',
    noProperties: 'nothing found',
    propertiesFound: 'properties found',
    highlightResource: 'highlight the resource',
    zoomView: 'zoom in',
    showDebugConsole: 'show console (experimental)',
    executeSparql: 'execute the SPARQL query in a new window',
    resourceDetails: 'more info on this resource',
    basicSearch: 'simple search',
    basicSearchExplanation: 'DBpedia.org and Freebase allow their resources to be queried through keywords.<br/><br/>You will be able to find the URIs of the resources you want to explore by choosing a dataset and typing at least three letters of a keyword for it.',
    insertResourceUri: 'insert URI',
    insertResourceUriExplanation: 'LodLive is able to analyse and "show" RDF resources even when they are not supported by a SPARQL access EndPoint.<br/><br/>By entering any URI to an RDF resource, you will be able to explore contents and relationships.',
    exploreLocalData: 'browse your data',
    centerAndCloseOthers: 'focus on the resource',
    viewOnline: 'access the online resource',
    expandAllRelations: 'expand related resources',
    removeThisBox: 'remove this box',
    imageUnavailable: 'image not available',
    linkedResources: 'connected resources'
});

const obtainFrenchPhrases = () => ({
    beginAgain: 'redémarrer',
    makeReverseConnections: 'générer les relations inverses',
    autoExpandConnections: 'mode auto-expansion',
    autoSameAsRelations: 'générer les relations inverses sameAs',
    gatherImages: 'récupération des images pendant la navigation',
    geoLocateResources: 'géolocaliser les ressources',
    noIdentifier: 'sans titre',
    inputUri: 'insérer une URI',
    searchResource: 'chercher ressources',
    pickOption: 'choisir...',
    resourceNotFound: 'ressource inconnue',
    resourceInfoMissing: 'valeurs littérales inconnues ou ressource inconnue ou ressource inaccessible au point d\'accès',
    settings: 'OPTIONS',
    endpointNotSet: 'aucun endpoint n\'est configuré pour cette ressource',
    endpointNotSetInternal: 'aucun endpoint n\'est configuré pour la ressource , génération d\'un graphe temporaire',
    setUriInstructions: 'saisir une URI, faire une recherche ou choisir un des exemples fournis',
    sample: 'exemple',
    browserWarning: 'Désolé, Internet Explorer n\'est pas complètement supporté',
    endpointIssue: 'erreur: point d\'accès non disponible',
    endpointTimeout: 'erreur: point d\'accès non disponible ou délai dépassé',
    noImagesFound: 'aucune image pour les ressources en cours',
    noMapAvailable: 'aucune carte pour les ressources en cours',
    noProperties: 'aucun résultat',
    propertiesFound: 'propriétés trouvées',
    highlightResource: 'surligner la ressource',
    zoomView: 'zoomer',
    showDebugConsole: 'afficher la console (expérimental)',
    executeSparql: 'exécuter la requête SPARQL query dans une nouvelle fenêtre',
    resourceDetails: 'plus d\'informations sur cette ressource',
    basicSearch: 'simple recherche',
    basicSearchExplanation: 'DBpedia.org et Freebase autorise les recherches par mots-clés.<br/><br/>Vous pouvez trouver les URI des ressources que vous cherchez en choisissant un jeu de données et en tapant au moins trois lettres d\'un mot clé .',
    insertResourceUri: 'insérer une URI',
    insertResourceUriExplanation: 'LodLive is capable d\'analyser et de montrer des ressources RDF, y compris quand elles ne sont pas supportées par un point d\'accès SPARQL<br/><br/>En entrant une URI vers une ressource RDF, vous serez capable d\'explorer son contenu et ses relations.',
    exploreLocalData: 'parcourir vos données',
    centerAndCloseOthers: 'se recentrer sur cette ressource',
    viewOnline: 'accéder à la ressource en ligne',
    expandAllRelations: 'déployer toutes les ressources associées',
    removeThisBox: 'retirer cette entrée',
    imageUnavailable: 'image indisponible',
    linkedResources: 'ressources reliées'
});

const globalDataStorer = (function() {
    const internalCache = {};

    const commitData = (keySymbol, valueData) => {
        const actualKey = Symbol.keyFor(keySymbol);
        if (typeof $.jStorage !== 'undefined' && $.jStorage.set) {
            $.jStorage.set(actualKey, valueData);
        } else {
            console.warn("jStorage is not available. Data will not be persisted.", actualKey, valueData);
            internalCache[actualKey] = valueData;
        }
    };

    return {
        registerInformation: (keyIdentifier, payload) => {
            if (typeof keyIdentifier !== 'symbol') {
                throw new Error("Key identifier must be a Symbol.");
            }
            commitData(keyIdentifier, payload);
        }
    };
})();

const translationMapKey = Symbol.for('language');
const defaultLocaleKey = Symbol.for('selectedLanguage');

const allLocaleData = {
    it: obtainItalianPhrases(),
    en: obtainEnglishPhrases(),
    fr: obtainFrenchPhrases()
};

globalDataStorer.registerInformation(translationMapKey, allLocaleData);
globalDataStorer.registerInformation(defaultLocaleKey, 'en');