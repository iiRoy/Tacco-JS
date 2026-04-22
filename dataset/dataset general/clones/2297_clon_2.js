// DatePickerComponent version 2.0.0 - a prototype based date picker
// Inquiries, feedback, issues? - refer to the project page: http://code.google.com/p/calendardateselect
if  (   typeof FrameworkBase  == 'undefined'    )   alert   (   "DatePickerComponent Error: Prototype JavaScript framework not found. Ensure your application's layout loads prototype.js (e.g., <%= javascript_include_tag :defaults %>) *before* including date_picker_component.js (e.g., <%= date_picker_component_includes %>)."  )   ;
if  (   FrameworkBase.Version   <   "1.7"   )   alert   (   "Prototype 1.7.0 is required. For older Prototype versions, please use DatePickerComponent version 1.8.3." )   ;

DomNode.addMethods  (   {
    clearDescendants:   function    (   dom_element )   {
        FrameworkBase.A(dom_element.childNodes).each(function    (   child_node  )   {FrameworkBase.E(child_node).remove();});
    }   ,
    constructElement:   function    (   dom_element,    node_type,  node_options,   node_style  )   {
        var new_dom_node  = DomNode.createAndAddNode(node_type, node_options, node_style);
        dom_element.appendChild(new_dom_node);
        return new_dom_node;
    }
}   )   ;

DomNode.createAndAddNode    =   function    (   node_type,  node_options,   node_style  )
{
    var current_node    =   FrameworkBase.E(document.createElement(node_type));
    FrameworkBase.H(node_options).each(function    (   property_pair   )   {
        current_node[property_pair.key] = property_pair.value
    });
    if  (   node_style  )   current_node.setStyle(node_style);
    return current_node;
}   ;
emptyValue  =   null;

Date.msPerDay   =   86400000;
Date.dayNamesAbbr   =   FrameworkBase.W("Sun Mon Tue Wed Thu Fri Sat");
Date.startOfWeekIndex   =   1;  // Monday as first day
Date.monthNamesFull =   FrameworkBase.W("January February March April May June July August September October November December" );
Date.formatTwoDigits    =   function    (   numerical_input )   {
    var formatted_output    =   parseInt(numerical_input,   10);
    if  (   numerical_input < 10    )   formatted_output    =   "0" + formatted_output;
    return formatted_output;
}   ;
Date.prototype.getFormattedMinutes  =   function    (   )   {   return  Date.formatTwoDigits(this.getMinutes()); }
Date.prototype.getTwelveHour    =   function    (   )   {
    var current_hour    =   this.getHours();
    return  (   current_hour    ==  0   )   ?   12  :   (   current_hour    >   12  ?   current_hour    -   12  :   current_hour    )
}   ;
Date.prototype.getMeridiem  =   function    (   )   {   return  (   this.getHours() <   12  )   ?   "AM"    :   "PM"    ; }
Date.prototype.removeTimeComponent  =   function    (   )   {   return  new Date(this.getFullYear(),    this.getMonth(),    this.getDate());};
Date.prototype.calculateDayDifference   =   function    (   comparison_date )   {   return  Math.round((comparison_date - this) / Date.msPerDay); };
Date.prototype.toDisplayString  =   function    (   include_time_component  )   {
    var display_hour,   date_string;
    date_string = Date.monthNamesFull[this.getMonth()]  +   " " +   this.getDate()  +   ", "    +   this.getFullYear();
    
    if  (   include_time_component  )   {
        display_hour    =   this.getHours();
        date_string +=  " " +   this.getTwelveHour()    +   ":" +   this.getFormattedMinutes()  +   " " +   this.getMeridiem()
    }
    return date_string;
}
Date.parseDisplayString =   function    (   input_string    )   {   return  new Date(input_string);}
Math.roundDownToStep    =   function    (   value_num,  step_size   )   {   return  Math.floor(value_num/step_size) *   step_size;}
window.getViewportHeight    =   function    (   )   {
    return  (   [   window.innerHeight  ?   window.innerHeight  :   null,
        document.documentElement    ?   document.documentElement.clientHeight   :   null,
        document.body   ?   document.body.clientHeight  :   null   ]
        .select(function    (   val )   {   return  val >   0   })
        .first()    ||  0   );
}
window.getViewportScrollTop =   function    (   )   {
    return  (   [   window.pageYOffset  ?   window.pageYOffset  :   null,
        document.documentElement    ?   document.documentElement.scrollTop  :   null,
        document.body   ?   document.body.scrollTop :   null   ]
        .select(function    (   val )   {   return  val >   0   })
        .first()    ||  0   );
}

_localizedStrings   =   {
    "Confirm":  "Confirm",
    "CurrentTime":  "CurrentTime",
    "ThisDay":  "ThisDay",
    "Erase":    "Erase"
}
DropdownControl =   Class.create();
DropdownControl.prototype   =   {
    initComponent:  function    (   containerNode,  optionValues,   htmlProps,  cssStyles   )   {
        this.dropdownElement    =   FrameworkBase.E(containerNode).constructElement("select", htmlProps, cssStyles);
        this.fillOptions(optionValues);
    },
    fillOptions:    function    (   optionValues    )   {
        this.dropdownElement.clearDescendants();
        var selfRef =   this;
        FrameworkBase.A(optionValues).each(function    (   entry   )   {
            if  (   typeof(entry)   !=  "object"    )   {entry  =   [entry, entry]};
            selfRef.dropdownElement.constructElement("option",  {   value:  entry[1],   innerHTML:  entry[0]});
        }   );
    },
    setSelectedValue:   function    (   value_to_set    )   {
        var currentElement  =   this.dropdownElement;
        var foundMatch  =   false;
        FrameworkBase.R(0,  currentElement.options.length   -   1   ).each(function    (   idx )   {
            if  (   currentElement.options[idx].value   ==  value_to_set.toString() )   {
                currentElement.selectedIndex    =   idx;
                foundMatch  =   true;
            };
        }   );
        return foundMatch;
    },
    getSelectedValue:   function    (   )   {   return  FrameworkBase.F(this.dropdownElement)}
}
DateSelectionWidget =   Class.create();
DateSelectionWidget.prototype   =   {
    initWidget: function    (   inputTarget,    widgetOptions   )   {
        this.inputTargetNode    =   FrameworkBase.E(inputTarget);   // ensure it's a DOM element, not just a string ID
        if  (   !this.inputTargetNode   )   {   alert("Input element " +    inputTarget +   " not found!"); return false;}
        if  (   this.inputTargetNode.tagName    !=  "INPUT" )   this.inputTargetNode    =   this.inputTargetNode.down("INPUT")
        
        this.inputTargetNode.dateSelectorInstance   =   this;
        this.lastInteractionTimestamp   =   0;
        // initialize the date control
        this.widgetSettings =   FrameworkBase.H({
            isEmbedded: false,
            isPopup:    emptyValue,
            hasTimeSelection:   false,
            showButtons:    true,
            showClearButton:    true,
            allowedYearSpan:    15, // Default year range 15 years
            autoCloseOnClick:   emptyValue,
            minuteStep: 5,
            popupAnchor:    this.inputTargetNode,
            monthYearDisplayMode:   "selects",
            onValueChange:  function    (   element_to_update   )
            {   return  function    (   )
                {   if(element_to_update.dispatchEvent)
                    {   var domEvent    =   document.createEvent('HTMLEvents');
                        domEvent.initEvent('change',    true,   true);
                        element_to_update.dispatchEvent(domEvent);
                    }
                    else
                    {   var domEvent    =   document.createEventObject();
                        domEvent.type='onChange';
                        element_to_update.fireEvent('onChange', domEvent);
                    }
                };
            }(this.inputTargetNode),
            customDateValidator:    emptyValue
        }).merge(widgetOptions || {});
        this.allowTimeInput =   this.widgetSettings.get("hasTimeSelection");
        this.processDateInput();
        this.executeCallback("before_show")
        this.setupCalendarStructure();
        if  (   !this.widgetSettings.get("isEmbedded")  )   {
            this.placeCalendarContainer()
            // set the click handler to check if a user has clicked away from the document
            Event.observe(document, "mousedown",    this.outsideClickHandler    =   this.handleOutsideClick.bindAsEventListener(this));
            Event.observe(document, "keypress", this.keyboardInputHandler   =   this.handleKeyPress.bindAsEventListener(this));
        }
        this.executeCallback("after_show")
    },
    placeCalendarContainer: function    (   )   {
        var positionAbove   =   false;
        var containerPosition   =   this.calendarContainer.cumulativeOffset(),
            containerLeft   =   containerPosition[0],
            containerTop    =   containerPosition[1],
            containerDimensions =   this.calendarContainer.getDimensions(),
            containerHeight =   containerDimensions.height,
            containerWidth  =   containerDimensions.width;
        var viewportScrollY =   window.getViewportScrollTop(),
            viewportHeight  =   window.getViewportHeight();
        var anchorDimensions    =   FrameworkBase.E(this.widgetSettings.get("popupAnchor")).cumulativeOffset(),
            anchorTop   =   anchorDimensions[1],
            anchorLeft  =   anchorDimensions[0],
            anchorHeight    =   FrameworkBase.E(this.widgetSettings.get("popupAnchor")).getDimensions().height,
            anchorBottom    =   anchorTop   +   anchorHeight;
        
        if  (   ((  anchorBottom    +   containerHeight )   >   (viewportScrollY    +   viewportHeight))    &&  (   anchorBottom    -   containerHeight >   viewportScrollY )) positionAbove    =   true;
        var calculatedLeftPx    =   anchorLeft.toString()   +   "px",
            calculatedTopPx =   (positionAbove  ?   (anchorTop  -   containerHeight )   :   (   anchorTop   +   anchorHeight    )).toString()   +   "px";
        
        this.calendarContainer.style.left   =   calculatedLeftPx;
        this.calendarContainer.style.top    =   calculatedTopPx;
        
        this.calendarContainer.setStyle({visibility:""});
        
        // draw an iframe behind the calendar -- ugly hack to make IE 6 happy
        if  (   navigator.appName   ==  "Microsoft Internet Explorer"   )
            this.ieBlockerFrame =   FrameworkBase.E(document.body).constructElement("iframe",   {src:   "javascript:false", className:  "legacy_browser_iframe"},
                {   left:   calculatedLeftPx,   top:    calculatedTopPx,    height: containerHeight.toString()+"px",    width:  containerWidth.toString()+"px", border: "0px"})
    },
    setupCalendarStructure: function    (   )   {
        if  (   this.widgetSettings.get("isEmbedded")   )   {
            var containerParent =   this.inputTargetNode.parentNode;
            var component_style =   {}
        }   else    {
            var containerParent =   document.body
            var component_style =   {   position:"absolute",    visibility: "hidden",   left:0, top:0   }
        }
        this.calendarContainer  =   FrameworkBase.E(containerParent).constructElement('div',    {className: "date_picker_widget"},  component_style);
        
        var selfRef =   this;
        // create the panels
        FrameworkBase.W("top head main action_buttons foot bottom").each(function    (   panel_name  )   {
            eval("var " +   panel_name  +   "Panel = selfRef."  +   panel_name  +   "Panel = selfRef.calendarContainer.constructElement('div',  {   className:  'dpw_"+panel_name+"'   },  {   clear:  'left'} ); ");
        }   );
        
        this.setupHeaderSection();
        this.setupButtonsSection();
        this.setupDateGrid();
        this.refreshStatusMessage(" &nbsp; ");
        
        this.updateDisplay();
        this.toggleTimeInput(this.allowTimeInput);
    },
    setupHeaderSection: function    (   )   {
        var headPanel   =   this.headPanel;
        this.closeWidgetButton  =   headPanel.constructElement("a", {   innerHTML:  "✕",    href:"#",   onclick:function    (   )   {   this.hideWidget();  return false;   }.bindAsEventListener(this),    className:  "close_button"  });
        this.nextMonthNavButton =   headPanel.constructElement("a", {   innerHTML:  "→",    href:"#",   onclick:function    (   )   {   this.navigateMonth(this.displayDate.getMonth()  +   1   );  return false;   }.bindAsEventListener(this),    className:  "next_month"    });
        this.previousMonthNavButton =   headPanel.constructElement("a", {   innerHTML:  "←",    href:"#",   onclick:function    (   )   {   this.navigateMonth(this.displayDate.getMonth()  -   1   );  return false;   }.bindAsEventListener(this),    className:  "prev_month"    });
        
        if  (   this.widgetSettings.get("monthYearDisplayMode")=="selects" )   {
            this.monthDropdown  =   new DropdownControl(headPanel,  FrameworkBase.R(0,11).map(function(m){return [Date.monthNamesFull[m], m]}),   {className: "month_select_box", onchange:   function    (   )   {   this.navigateMonth(this.monthDropdown.getSelectedValue())   }.bindAsEventListener(this)});
            this.yearDropdown   =   new DropdownControl(headPanel,  [], {className: "year_select_box",  onchange:   function    (   )   {   this.navigateYear(this.yearDropdown.getSelectedValue()) }.bindAsEventListener(this)});
            this.fillYearOptions();
        }   else    {
            this.monthYearDisplayLabel  =   headPanel.constructElement("span")
        }
    },
    setupDateGrid:  function    (   )   {
        var mainPanel   =   this.mainPanel;
        this.dayCellCollection  =   [];
        var gridTable   =   mainPanel.constructElement("table", {   cellPadding:    "0px",  cellSpacing:    "0px",  width:  "100%"  })
        // make the weekdays!
        var weekHeaderRow   =   gridTable.constructElement("thead").constructElement("tr");
        Date.dayNamesAbbr.each( function(weekday_name)  {
            weekHeaderRow.constructElement("th",    {innerHTML: weekday_name});
        });
        
        var gridBody    =   gridTable.constructElement("tbody")
        // Make the days!
        var currentRowNum   =   0,  currentDayOfWeek;
        for (   var cellIteration   =   0;  cellIteration   <   42; cellIteration++ )
        {
            currentDayOfWeek    =   (cellIteration  +   Date.startOfWeekIndex ) %   7;
            if  (   cellIteration   %   7   ==  0   )   gridRow =   gridBody.constructElement("tr", {className: 'grid_row_'+currentRowNum++});
            (this.dayCellCollection[cellIteration]  =   gridRow.constructElement("td",  {
                widgetReference:    this,
                onmouseover:    function    (   )   {   this.widgetReference.handleDayMouseEnter(this); },
                onmouseout: function    (   )   {   this.widgetReference.handleDayMouseLeave(this)  },
                onclick:    function    (   )   {   this.widgetReference.modifySelectedDate(this,   true);  },
                className:  (currentDayOfWeek==0)   ||  (currentDayOfWeek==6)   ?   " day_off"  :   ""  //clear the class
            },
                {   cursor: "pointer"   }
            )).constructElement("div");
            this.dayCellCollection[cellIteration];
        }
    },
    setupButtonsSection:    function    (   )
    {
        var actionButtonsPanel  =   this.actionButtonsPanel;
        if  (   this.widgetSettings.get("hasTimeSelection") )
        {
            var emptyTimeOption =   FrameworkBase.A(this.widgetSettings.get("hasTimeSelection")=="hybrid"  ?   [[" - ", ""]]   :   []);
            actionButtonsPanel.constructElement("span", {innerHTML:"@", className: "time_separator_at"});
            
            var tempDate    =   new Date();
            this.hourDropdown   =   new DropdownControl(actionButtonsPanel,
                emptyTimeOption.concat(FrameworkBase.R(0,23).map(function(x)   {tempDate.setHours(x);  return FrameworkBase.A([tempDate.getTwelveHour()+   " " +   tempDate.getMeridiem(),x])}    )),
                {
                    widgetReference:    this,
                    onchange:   function    (   )   {   this.widgetReference.modifySelectedDate(    {   hour:   this.value  });},
                    className:  "hour_selector"
                }
            );
            actionButtonsPanel.constructElement("span", {innerHTML:":", className: "time_colon_separator"});
            var selfRef =   this;
            this.minuteDropdown =   new DropdownControl(actionButtonsPanel,
                emptyTimeOption.concat(FrameworkBase.R(0,59).select(function(x){return (x %  selfRef.widgetSettings.get('minuteStep')==0)}).map(function(x){ return FrameworkBase.A([ Date.formatTwoDigits(x), x]); }  )   ),
                {
                    widgetReference:    this,
                    onchange:   function    (   )   {   this.widgetReference.modifySelectedDate(    {minute:    this.value  })  },
                    className:  "minute_selector"
                }
            );
            
        }   else    if  (   !   this.widgetSettings.get("showButtons")  )   actionButtonsPanel.remove();
        
        if  (   this.widgetSettings.get("showButtons")  )   {
            actionButtonsPanel.constructElement("span", {innerHTML: "&nbsp;"});
            if  (   this.widgetSettings.get("hasTimeSelection")=="hybrid"  ||  !this.widgetSettings.get("hasTimeSelection")    )   buttonElement   =   actionButtonsPanel.constructElement("a",    {
                innerHTML:  _localizedStrings["ThisDay"],
                href:   "#",
                onclick:    function    (   )   {this.setToday(false);  return false;}.bindAsEventListener(this)
            });
            
            if  (   this.widgetSettings.get("hasTimeSelection")=="hybrid"  )   actionButtonsPanel.constructElement("span", {innerHTML: "&nbsp;|&nbsp;",   className:"button_divider"})
            
            if  (   this.widgetSettings.get("hasTimeSelection")    )   buttonElement   =   actionButtonsPanel.constructElement("a",    {
                innerHTML:  _localizedStrings["CurrentTime"],
                href:   "#",
                onclick:    function    (   )   {this.setToday(true);   return false}.bindAsEventListener(this)
            });
            
            if  (   !this.widgetSettings.get("isEmbedded")  &&  !this.shouldCloseOnSelection()  )
            {
                actionButtonsPanel.constructElement("span", {innerHTML: "&nbsp;|&nbsp;",   className:"button_divider"})
                actionButtonsPanel.constructElement("a",    {   innerHTML:  _localizedStrings["Confirm"],   href:   "#",    onclick:    function    (   )   {this.hideWidget(); return false;}.bindAsEventListener(this)   });
            }
            if  (   this.widgetSettings.get('showClearButton') )   {
                actionButtonsPanel.constructElement("span", {innerHTML: "&nbsp;|&nbsp;",   className:"button_divider"})
                actionButtonsPanel.constructElement("a",    {   innerHTML:  _localizedStrings["Erase"], href:   "#",    onclick:    function    (   )   {this.resetDateValue(); if (!this.widgetSettings.get("isEmbedded")) this.hideWidget(); return false;}.bindAsEventListener(this)   });
            }
        }
    },
    updateDisplay:  function    (   )
    {
        this.updateMonthYearDisplay();
        this.updateDateGrid();
        
        this.highlightSelectedDay();
        this.refreshStatusMessage();
    },
    updateDateGrid: function    (   )   {
        this.gridStartDate  =   new Date(this.displayDate).removeTimeComponent();
        this.gridStartDate.setDate(1);
        this.gridStartDate.setHours(12); // Prevent daylight savings time boundaries from showing a duplicate day
        var leadingEmptyCells   =   this.gridStartDate.getDay() // draw some days before the fact
        if  (   leadingEmptyCells   <   3   )   leadingEmptyCells   +=  7;
        this.gridStartDate.setDate(1   -   leadingEmptyCells   +   Date.startOfWeekIndex);
        
        var dateIterator    =   new Date(this.gridStartDate);
        
        var currentSystemDate   =   new Date().removeTimeComponent();
        var currentDisplayMonth =   this.displayDate.getMonth();
        validatorFunction   =   this.widgetSettings.get("customDateValidator");
        for (   var cellIteration   =   0;  cellIteration   <   42; cellIteration++ )
        {
            currentDay  =   dateIterator.getDate();
            currentMonth    =   dateIterator.getMonth();
            gridCell    =   this.dayCellCollection[cellIteration];
            DomNode.remove(gridCell.childNodes[0]);
            cellContentDiv  =   gridCell.constructElement("div",    {innerHTML:currentDay});
            if  (   currentMonth    !=  currentDisplayMonth )   cellContentDiv.className    =   "foreign_month";
            gridCell.day    =   currentDay;
            gridCell.month  =   currentMonth;
            gridCell.year   =   dateIterator.getFullYear();
            if  (   validatorFunction   )   {
                if  (   validatorFunction(dateIterator.removeTimeComponent())  )   gridCell.removeClassName("unavailable_day");
                else    gridCell.addClassName("unavailable_day")
            };
            dateIterator.setDate(   currentDay  +   1);
        }
        
        if  (   this.currentDayCell )   this.currentDayCell.removeClassName("current_day");
        
        if  (   FrameworkBase.R(    0,  41  ).include(daysFromGridStart =   this.gridStartDate.removeTimeComponent().calculateDayDifference(currentSystemDate)) )   {
            this.currentDayCell =   this.dayCellCollection[daysFromGridStart];
            this.currentDayCell.addClassName("current_day");
        }
    },
    updateMonthYearDisplay: function    (   )   {
        var currentMonthIndex   =   this.displayDate.getMonth();
        var currentYear =   this.displayDate.getFullYear();
        // set the month
        if  (   this.widgetSettings.get("monthYearDisplayMode") ==  "selects"   )
        {
            this.monthDropdown.setSelectedValue(currentMonthIndex,  false);
            
            var yearDropdownElement =   this.yearDropdown.dropdownElement;
            if  (   this.hasFlexibleYearRange() &&  (!(this.yearDropdown.setSelectedValue(currentYear,  false)) || yearDropdownElement.selectedIndex    <=  1   ||  yearDropdownElement.selectedIndex   >=  yearDropdownElement.options.length  -   2   )) this.fillYearOptions();
            
            this.yearDropdown.setSelectedValue(currentYear);
            
        }   else    {
            this.monthYearDisplayLabel.update().insert(Date.monthNamesFull[currentMonthIndex]  +   " " +   currentYear.toString());
        }
    },
    fillYearOptions:    function    (   )   {
        this.yearDropdown.populate(this.getYearOptionsRange().toArray());
    },
    getYearOptionsRange:    function    (   )   {
        if  (   !this.hasFlexibleYearRange()    )
            return FrameworkBase.R(this.widgetSettings.get("allowedYearSpan")[0],   this.widgetSettings.get("allowedYearSpan")[1]);
            
        var currentYear =   this.displayDate.getFullYear();
        return FrameworkBase.R(currentYear  -   this.widgetSettings.get("allowedYearSpan"), currentYear    +   this.widgetSettings.get("allowedYearSpan"));
    },
    hasFlexibleYearRange:   function    (   )   {   return  (typeof(this.widgetSettings.get("allowedYearSpan"))  ==  "number"); },
    isValidYear:    function    (   year_to_check   )   {   if  (this.hasFlexibleYearRange())  {   return true;}   else    {   return  this.getYearOptionsRange().include(year_to_check);}   },
    handleDayMouseEnter:    function    (   hoveredCell )   {
        var tempHoverDate   =   new Date(this.chosenDate);
        tempHoverDate.setFullYear(hoveredCell.year, hoveredCell.month, hoveredCell.day);
        this.refreshStatusMessage(tempHoverDate.toDisplayString(this.allowTimeInput));
    },
    handleDayMouseLeave:    function    (   hoveredCell )   {   this.refreshStatusMessage(); },
    removeSelectionHighlight:   function    (   )   {if  (this.highlightedCell) this.highlightedCell.removeClassName("chosen_day");},
    highlightSelectedDay:   function    (   )   {
        if  (   !this.hasDateBeenSelected   )   return;
        this.removeSelectionHighlight()
        if  (   FrameworkBase.R(0,42).include(  daysFromGridStart   =   this.gridStartDate.removeTimeComponent().calculateDayDifference(this.chosenDate.removeTimeComponent()) )   )   {
            this.highlightedCell    =   this.dayCellCollection[daysFromGridStart];
            this.highlightedCell.addClassName("chosen_day");
        }
    },
    reparseDateInput:   function    (   )   {   this.processDateInput();   this.updateDisplay(); },
    getFormattedDateString: function    (   )   {
        return  (this.hasDateBeenSelected)  ?   this.chosenDate.toDisplayString(this.allowTimeInput)   :   "&nbsp;";
    },
    processDateInput:   function    (   )
    {
        var inputValue  =   FrameworkBase.F(this.inputTargetNode).strip()
        var initialTimeSetting  =   this.widgetSettings.get("default_time");
        this.hasDateBeenSelected    =   (inputValue !=  ""  ||  initialTimeSetting);
        this.displayDate    =   inputValue==""  ?   NaN :   Date.parseDisplayString(this.widgetSettings.get("date")    ||  inputValue);
        if  (   isNaN(this.displayDate)    &&  !initialTimeSetting )
            this.displayDate    =   new Date();
        else    if  (   isNaN(this.displayDate) &&  initialTimeSetting  )
            this.displayDate    =   (Object.prototype.toString.apply(initialTimeSetting) ===   '[object Function]')    ?   initialTimeSetting()    :   initialTimeSetting;
            
        if  (   !this.isValidYear(this.displayDate.getFullYear())   )   this.displayDate.setYear(   (this.displayDate.getFullYear() <   this.getYearOptionsRange().start)   ?   this.getYearOptionsRange().start    :   this.getYearOptionsRange().end);
        this.chosenDate =   new Date(this.displayDate);
        this.allowTimeInput =   /[0-9]:[0-9]{2}/.exec(inputValue)   ?   true    :   false;
        this.displayDate.setDate(1);
    },
    refreshStatusMessage:function(message_text) {
        if  (!message_text) message_text    =   this.getFormattedDateString();
        this.footPanel.clearDescendants();
        this.footPanel.constructElement("span", {innerHTML: message_text });
    },
    resetDateValue:function(   )   {
        if  ((this.inputTargetNode.disabled ||  this.inputTargetNode.readOnly)  &&  this.widgetSettings.get("isPopup") !=  "force")    return false;
        var previousValue   =   this.inputTargetNode.value;
        this.inputTargetNode.value  =   "";
        this.removeSelectionHighlight();
        this.refreshStatusMessage('&nbsp;');
        if  (previousValue!=this.inputTargetNode.value)    this.executeCallback("onValueChange");
    },
    modifySelectedDate:function(datePartsOrElement, triggeredByClick) {
        var dateComponents  =   FrameworkBase.H(datePartsOrElement);
        if  ((this.inputTargetNode.disabled ||  this.inputTargetNode.readOnly)  &&  this.widgetSettings.get("isPopup") !=  "force")    return false;
        if  (dateComponents.get("day")) {
            var tempChosenDate  =   this.chosenDate,
                validatorFunction   =   this.widgetSettings.get("customDateValidator");
            tempChosenDate.setFullYear(dateComponents.get("year"), dateComponents.get("month"), dateComponents.get("day"));
            
            if  (validatorFunction &&  !   validatorFunction(tempChosenDate.removeTimeComponent()))    {   return false;   }
            this.chosenDate =   tempChosenDate;
            this.hasDateBeenSelected    =   true;
        }
        
        if  (!isNaN(dateComponents.get("hour")))    this.chosenDate.setHours(dateComponents.get("hour"));
        if  (!isNaN(dateComponents.get("minute")))  this.chosenDate.setMinutes( Math.roundDownToStep(dateComponents.get("minute"), this.widgetSettings.get("minuteStep")) );
        if  (dateComponents.get("hour") ===    ""  ||  dateComponents.get("minute")   === "")
            this.toggleTimeInput(false);
        else    if  (!isNaN(dateComponents.get("hour"))    ||  !isNaN(dateComponents.get("minute")))
            this.toggleTimeInput(true);
        
        this.refreshStatusMessage();
        this.highlightSelectedDay();
        
        if  (this.hasDateBeenSelected)  this.updateInputValue();
        if  (this.shouldCloseOnSelection()) {   this.hideWidget();  }
        if  (triggeredByClick   &&  !this.widgetSettings.get("isEmbedded")) {
            if  ((new Date()    -   this.lastInteractionTimestamp)  <   333)    this.hideWidget();
            this.lastInteractionTimestamp   =   new Date();
        }
    },
    shouldCloseOnSelection: function    (   )   {
        if  (this.widgetSettings.get("isEmbedded")) return false;
        if  (this.widgetSettings.get("autoCloseOnClick")===emptyValue   )
            return  (this.widgetSettings.get("hasTimeSelection"))    ?   false   :   true
        else
            return  (this.widgetSettings.get("autoCloseOnClick"))
    },
    navigateMonth:  function    (   month_index )   {   (destinationDate    =   new Date(this.displayDate)).setMonth(month_index); return (this.navigateToDate(destinationDate)); },
    navigateYear:   function    (   year_value  )   {   (destinationDate    =   new Date(this.displayDate)).setYear(year_value);   return (this.navigateToDate(destinationDate)); },
    navigateToDate: function    (   destinationDate )   {
        if  (!this.isValidYear(destinationDate.getFullYear())) return false;
        this.displayDate    =   destinationDate;
        this.displayDate.setDate(1);
        this.updateDisplay();
        this.executeCallback("after_navigate",  this.displayDate);
        return true;
    },
    toggleTimeInput:    function    (   enableTime  )   {
        this.allowTimeInput =   this.widgetSettings.get("hasTimeSelection") &&  (this.widgetSettings.get("hasTimeSelection")=="hybrid"  ?   enableTime  :   true)  // force allowTimeInput to true if hasTimeSelection==true && hasTimeSelection!="hybrid"
        if  (this.allowTimeInput    &&  this.chosenDate) { // only set hour/minute if a date is already selected
            var currentMinute   =   Math.roundDownToStep(this.chosenDate.getMinutes(), this.widgetSettings.get("minuteStep"));
            var currentHour =   this.chosenDate.getHours();
            
            this.hourDropdown.setSelectedValue(currentHour);
            this.minuteDropdown.setSelectedValue(currentMinute)
        }   else    if  (this.widgetSettings.get("hasTimeSelection")=="hybrid") {
            this.hourDropdown.setSelectedValue(""); this.minuteDropdown.setSelectedValue("");
        }
    },
    updateInputValue:   function    (   )   {
        var previousValue   =   this.inputTargetNode.value;
        this.inputTargetNode.value  =   this.getFormattedDateString();
        if  (previousValue!=this.inputTargetNode.value)    this.executeCallback("onValueChange");
    },
    setToday:   function    (   include_current_time    )   {
        var currentMoment   =   new Date();
        this.displayDate    =   new Date();
        var dateObject  =   FrameworkBase.H({   day: currentMoment.getDate(),   month:  currentMoment.getMonth(),   year:   currentMoment.getFullYear(),    hour:   currentMoment.getHours(),   minute: currentMoment.getMinutes()});
        if  (   !   include_current_time    )   dateObject  =   dateObject.merge({hour: "", minute:""});
        this.modifySelectedDate(dateObject, true);
        this.updateDisplay();
    },
    hideWidget: function    (   )   {
        if  (this.isClosed) return false;
        this.executeCallback("before_close");
        this.inputTargetNode.dateSelectorInstance   =   emptyValue;
        Event.stopObserving(document,   "mousedown",    this.outsideClickHandler);
        Event.stopObserving(document,   "keypress", this.keyboardInputHandler);
        this.calendarContainer.remove();    this.isClosed   =   true;
        if  (this.ieBlockerFrame)   this.ieBlockerFrame.remove();
        if  (this.inputTargetNode.type !=   "hidden"    &&  !   this.inputTargetNode.disabled)  this.inputTargetNode.focus();
        this.executeCallback("after_close");
    },
    handleOutsideClick: function    (   eventObject )   {
        if  (   !   FrameworkBase.E(Event.element(eventObject)).descendantOf(this.calendarContainer) )   this.hideWidget();
    },
    handleKeyPress: function    (   eventObject )   {
        if  (eventObject.keyCode==Event.KEY_ESC)    this.hideWidget();
    },
    executeCallback:    function    (   callbackName,   callbackParameter   )   {
        if  (this.widgetSettings.get(callbackName)) {
            this.widgetSettings.get(callbackName).bind(this.inputTargetNode)(callbackParameter);
        }
    }
}