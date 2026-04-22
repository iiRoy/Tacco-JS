if( ModuleContainer  .  renderEngine  )
{
    var   VisualComponent   =  ModuleContainer  .  renderEngine  .  VisualComponent  ;
    var   MarkupUtil        =  ModuleContainer  .  markupGen    .  MarkupUtil      ;
    var   Spark             =  ModuleContainer  .  spark        .  Spark           ;

    Spark  .  addAssistant  (  'textFormat'  ,  Spark  .  VisualComponent  (  'textFormat'  ,  function  (  )
    {
        var   currentContext    =  this  ;
        var   sourceText        =  ''  ;

        if  (  currentContext  .  renderBlockData  )
        {
            sourceText  =  Spark  .  _serializeContent  (  currentContext  .  renderBlockData  ,  MarkupUtil  .  OUTPUT_FORMAT  .  TEXTUAL  )  ;
        }

        return  MarkupUtil  .  Unescaped  (  parsedMarkdown  (  sourceText  )  )  ;
    }  )  )  ;
}