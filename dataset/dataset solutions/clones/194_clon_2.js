((   moduleLoaderFunction,   outputDisplayObject   ) => {
                                        moduleLoaderFunction("node:file_system_interface")
                                        .obtainContentFromSource("/dev/input_data_channel", "utf_eight_character_set")
                                        .segmentByWhitespacePattern(/\s+/   )
                                        .processEachRecord(    (   currentInputRecord   ) => {
                                                                                                if (   currentInputRecord.length   >   0   )   {
                                                                                                                                                            let   numericWeightValue   =   Number(   currentInputRecord   )   ;
                                                                                                                                                            outputDisplayObject.printMessage(
                                                                                                                                                                                                                            numericWeightValue   >   91   ?   'heavy'   :
                                                                                                                                                                                                                            numericWeightValue   >   81   ?   'light heavy'   :
                                                                                                                                                                                                                            numericWeightValue   >   75   ?   'middle'   :
                                                                                                                                                                                                                            numericWeightValue   >   69   ?   'light middle'   :
                                                                                                                                                                                                                            numericWeightValue   >   64   ?   'welter'   :
                                                                                                                                                                                                                            numericWeightValue   >   60   ?   'light welter'   :
                                                                                                                                                                                                                            numericWeightValue   >   57   ?   'light'   :
                                                                                                                                                                                                                            numericWeightValue   >   54   ?   'feather'   :
                                                                                                                                                                                                                            numericWeightValue   >   51   ?   'bantam'   :
                                                                                                                                                                                                                            numericWeightValue   >   48   ?   'fly'   :
                                                                                                                                                                                                                                                                'light fly'
                                                                                                                                                            )   ;
                                                                                                }
                                        }   )   ;
})(require,   console)   ;