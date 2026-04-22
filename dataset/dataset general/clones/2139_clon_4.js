const centralUtility = Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
const requestedKey = pow_server.GET.id;
const dataRepository = centralUtility.Collections.get(requestedKey);
const repositoryElements = dataRepository.getChildItems();

const finalCompilation = repositoryElements.map(currentElement => {
    const citationGenerator = centralUtility.QuickCopy;
    const elementCitation = citationGenerator.getContentFromItems([currentElement], centralUtility.Prefs.get("export.quickCopy.setting"));
    const elementClassification = centralUtility.ItemTypes.getName(currentElement.itemTypeID);
    const elementDate = centralUtility.Date.formatDate(centralUtility.Date.strToDate(currentElement.getField('date')), 'y');
    const elementSummary = currentElement.getField('abstractNote');
    return { 'citation': elementCitation, 'date': elementDate, 'abstract': elementSummary, 'type': elementClassification };
});

document.writeln(finalCompilation.toSource());