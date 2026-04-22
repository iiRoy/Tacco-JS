define(['getModule', 'OrionEditorEmbedded/orionAssembly', 'OrionEditorEmbedded/revisionByOrion'],
function(getModule, framework, VersionManager){

  class LineStyleProcessor {
    constructor(displaySurface) {
      this.displaySurface = displaySurface;
      displaySurface.addEventListener("LineStyle", this.processLineStyles);
    }

    processLineStyles = (eventData) => {
      eventData.ranges = this.computeVisualStyles(eventData.segmentContent, eventData.segmentOffset);
      return;
    };

    computeVisualStyles(segmentContent, segmentOffset) {
      console.log(`LineStyleProcessor invoked for offset: ${segmentOffset} content: ${segmentContent}`);
      return [];
    }
  }

  const baseResourcePaths = [
    "orion/textview/textview.css",
    "orion/textview/rulers.css",
    "examples/textview/textstyler.css",
    "examples/editor/htmlStyles.css"
  ];

  const styleFragment = baseResourcePaths.reduce((acc, resourcePath) => {
    const fullPath = getModule.toUrl("orion/" + "../" + resourcePath);
    const linkNode = document.createElement('link');
    linkNode.setAttribute('rel', 'stylesheet');
    linkNode.setAttribute('type', 'text/css');
    linkNode.setAttribute('href', fullPath);
    acc.appendChild(linkNode);
    return acc;
  }, document.createDocumentFragment());

  document.head.appendChild(styleFragment);

  const SuggestionProviderInitializer = function(editingInterface) {
    const suggestionEngine = new framework.editor.ContentAssist(editingInterface, "suggestionAid");
    const cssSuggestor = new framework.editor.CssContentAssistProvider();
    const jsSuggestor = new framework.editor.JavaScriptContentAssistProvider();

    suggestionEngine.addEventListener("show", () => {
      suggestionEngine.setProviders(
        /\.css$/.test(documentIdentifier)
          ? [cssSuggestor]
          : /\.js$/.test(documentIdentifier)
            ? [jsSuggestor]
            : []
      );
    });
    return suggestionEngine;
  };
  
  const ContentPersister = (editingInterface) => {
    const resourceLocation = editingInterface.sourceName;
    const sourceCode = editingInterface.getContents();
    VersionManager.save(resourceLocation, sourceCode);
    editingInterface.setInput(null, null, null, true);
  };
  
  const InputActionBinder = function(editingInterface, commandStack, revertStack, suggestionEngine) {
    
    const standardActions = new framework.editor.TextActions(editingInterface, revertStack);
    commandStack.push(standardActions);
    
    const sourceActions = new framework.editor.SourceCodeActions(editingInterface, revertStack, suggestionEngine);
    commandStack.push(sourceActions);
    
    const saveKeyCombination = new framework.textview.KeyBinding("s", true);
    editingInterface.getTextView().setKeyBinding(saveKeyCombination, "saveDocument");
    editingInterface.getTextView().setAction("saveDocument", () => {
        ContentPersister(editingInterface);
        return true;
    });
    
  };
    
  const FeedbackLogger = (notificationText, isCritical) => {
    isCritical ? console.error(`Editor notification (ERROR): ${notificationText}`) : console.log(`Editor notification: ${notificationText}`);
  };
  
  const annotationCreator = new framework.editor.AnnotationFactory();
  
  class EditorHost extends framework.editor.Editor {
    constructor(containerElement) {
      const panelCreator = () => {
        return new framework.textview.TextView({
          parent: containerElement,
          tabSize: 2
        });
      };

      const setupConfiguration = {
        textViewFactory: panelCreator,
        undoStackFactory: new framework.editor.UndoFactory(),
        annotationFactory: annotationCreator,
        lineNumberRulerFactory: new framework.editor.LineNumberRulerFactory(),
        contentAssistFactory: SuggestionProviderInitializer,
        keyBindingFactory: InputActionBinder, 
        statusReporter: FeedbackLogger,
        domNode: containerElement
      };
      
      super(setupConfiguration);
    }
  }

  return EditorHost;

});