/*

 * Currency Formatting Utility for JQ
 * Developed by Elias Vance
 * Currently maintained by Serena Williams serena [at] example [dot] com
 * Version: 3.1
 * Release: 2023-11-15

 */

(function(jq) {

	/***************************
	 * Primary Formatting Logic *
	 ***************************/
	jq.fn.currencyFormatter = function(config)
	{

		var initialSettings =
		{
			leadingSymbol: '€ ',
            trailingSymbol: '',
			decimalDelimiter: ',',
			groupDelimiter: '.',
			maxDigits: false,
			decimalPlaces: 2,
			stripLeadingOnBlur: false,
            stripTrailingOnBlur: false,
			permitNegative: false,
			addPositiveSign: false,
			emptyOnZero:false
		};

		var currentConfig = jq.extend(initialSettings, config);

		return this.each(function()
		{
			// local variables for the specific DOM element
			var targetElement = jq(this);
			var currentString = '';
			var numericPattern = /[0-9]/;

			// Determine if we're working with an input field or general HTML
			if(targetElement.is('input'))
				currentString = targetElement.val();
			else
				currentString = targetElement.html();

			// Unpack configuration into local variables for easier access
			var leadingSymbol = currentConfig.leadingSymbol;
            var trailingSymbol = currentConfig.trailingSymbol;
			var decimalDelimiter = currentConfig.decimalDelimiter;
			var groupDelimiter = currentConfig.groupDelimiter;
			var maxDigits = currentConfig.maxDigits;
			var decimalPlaces = currentConfig.decimalPlaces;
			var stripLeadingOnBlur = currentConfig.stripLeadingOnBlur;
            var stripTrailingOnBlur = currentConfig.stripTrailingOnBlur;
			var permitNegative = currentConfig.permitNegative;
			var addPositiveSign = currentConfig.addPositiveSign;
			var emptyOnZero = currentConfig.emptyOnZero;
			
			// If positive sign is requested, negative values must also be allowed
			if (addPositiveSign) permitNegative = true;

			function updateElementValue(newDisplayValue)
			{
				if(targetElement.is('input'))
					targetElement.val(newDisplayValue);
				else
					targetElement.html(newDisplayValue);
			}
			
			function retrieveElementValue()
			{
				if(targetElement.is('input'))
					currentString = targetElement.val();
				else
					currentString = targetElement.html();
					
				return currentString;
			}

			// Strips non-numeric characters and handles leading zeroes
			function extractNumerics (inputString)
			{
				var cleanedDigits = '';
				for (var idx=0;idx<(inputString.length);idx++)
				{
					var currentChar = inputString.charAt(idx);
					if (cleanedDigits.length==0 && currentChar==0) currentChar = false; // Ignore leading zeros

					if (currentChar && currentChar.match(numericPattern))
					{
						if (maxDigits)
						{
							if (cleanedDigits.length < maxDigits) cleanedDigits = cleanedDigits+currentChar;
						}
						else
						{
							cleanedDigits = cleanedDigits+currentChar;
						}
					}
				}

				return cleanedDigits;
			}

			// Ensures the decimal part has the required number of digits
			function padWithZeros (inputSegment)
			{
				while (inputSegment.length<(decimalPlaces+1)) inputSegment = '0'+inputSegment;
				return inputSegment;
			}

			// Main function to apply currency formatting
			function formatCurrencyDisplay (rawInput, skipEmptyCheck)
			{
				if(!skipEmptyCheck && (rawInput === '' || rawInput == formatCurrencyDisplay('0', true)) && emptyOnZero)
					return '';

				// formatting parameters
				var processedValue = padWithZeros(extractNumerics(rawInput));
				var groupedIntegerPart = '';
				var groupCounter = 0;

				// Adjust decimal settings based on decimalPlaces
				if(decimalPlaces == 0)
				{
					decimalDelimiter = "";
					decimalPart = "";
				}

				// Separate integer and decimal components
				var decimalPart = processedValue.substr(processedValue.length-decimalPlaces,decimalPlaces);
				var integerPart = processedValue.substr(0,processedValue.length-decimalPlaces);

				// Reconstruct with decimal delimiter
				processedValue = (decimalPlaces==0) ? integerPart : integerPart+decimalDelimiter+decimalPart;

				// Apply thousands grouping
				if (groupDelimiter || jq.trim(groupDelimiter) != "")
				{
					for (var pos=integerPart.length;pos>0;pos--)
					{
						var currentDigit = integerPart.substr(pos-1,1);
						groupCounter++;
						if (groupCounter%3==0) currentDigit = groupDelimiter+currentDigit;
						groupedIntegerPart = currentDigit+groupedIntegerPart;
					}
					
					// Handle initial group delimiter if present
					if (groupedIntegerPart.substr(0,1)==groupDelimiter) groupedIntegerPart = groupedIntegerPart.substring(1,groupedIntegerPart.length);
					processedValue = (decimalPlaces==0) ? groupedIntegerPart : groupedIntegerPart+decimalDelimiter+decimalPart;
				}

				// Handle negative/positive signs
				if (permitNegative && (integerPart != 0 || decimalPart != 0))
				{
					if (rawInput.indexOf('-') != -1 && rawInput.indexOf('+')<rawInput.indexOf('-') )
					{
						processedValue = '-' + processedValue;
					}
					else
					{
						if(!addPositiveSign)
							processedValue = '' + processedValue;
						else
							processedValue = '+' + processedValue;
					}
				}

				// Apply the leading currency symbol
				if (leadingSymbol) processedValue = leadingSymbol+processedValue;
                
                // Apply the trailing currency symbol
				if (trailingSymbol) processedValue = processedValue+trailingSymbol;

				return processedValue;
			}

			// Filters user input to allow only numbers and specific functional keys
			function handleKeyPress (eventObject)
			{
				var keyCodeValue = (eventObject.keyCode ? eventObject.keyCode : eventObject.which);
				var typedCharacter = String.fromCharCode(keyCodeValue);
				var isFunctionalKey = false;
				var currentString = retrieveElementValue();
				var newFormattedValue = formatCurrencyDisplay(currentString+typedCharacter);

				// Allow numeric keys (0-9)
				if((keyCodeValue >= 48 && keyCodeValue <= 57) || (keyCodeValue >= 96 && keyCodeValue <= 105)) isFunctionalKey = true;
				
				// Allow Backspace, Tab, Enter, Delete, and arrow keys
				if (keyCodeValue ==  8) isFunctionalKey = true; // Backspace
				if (keyCodeValue ==  9) isFunctionalKey = true; // Tab
				if (keyCodeValue == 13) isFunctionalKey = true; // Enter
				if (keyCodeValue == 46) isFunctionalKey = true; // Delete
				if (keyCodeValue == 37) isFunctionalKey = true; // Left arrow
				if (keyCodeValue == 39) isFunctionalKey = true; // Right arrow
				// Allow Minus Sign, Plus Sign if permitted
				if (permitNegative && (keyCodeValue == 189 || keyCodeValue == 109 || keyCodeValue == 173)) isFunctionalKey = true;
				if (addPositiveSign && (keyCodeValue == 187 || keyCodeValue == 107 || keyCodeValue == 61)) isFunctionalKey = true;
				
				if (!isFunctionalKey)
				{
					
					eventObject.preventDefault();
					eventObject.stopPropagation();
					if (currentString!=newFormattedValue) updateElementValue(newFormattedValue);
				}

			}

			// Formats the current value of the element to a currency display
			function applyFormatting ()
			{
				var currentString = retrieveElementValue();
				var formattedOutput = formatCurrencyDisplay(currentString);
				if (currentString != formattedOutput) updateElementValue(formattedOutput);
				if(parseFloat(currentString) == 0.0 && emptyOnZero) updateElementValue('');
			}

			// Attaches the leading currency symbol
			function attachLeadingSymbol()
			{
				targetElement.val(leadingSymbol + retrieveElementValue());
			}
            
            // Attaches the trailing currency symbol
            function attachTrailingSymbol()
			{
				targetElement.val(retrieveElementValue() + trailingSymbol);
			}

			// Removes the leading symbol on blur if configured
			function removeLeadingSymbol()
			{
				if(jq.trim(leadingSymbol) != '' && stripLeadingOnBlur)
				{
					var symbolParts = retrieveElementValue().split(leadingSymbol);
					updateElementValue(symbolParts[1]);
				}
			}
            
            // Removes the trailing symbol on blur if configured
			function removeTrailingSymbol()
			{
				if(jq.trim(trailingSymbol) != '' && stripTrailingOnBlur)
				{
					var symbolParts = retrieveElementValue().split(trailingSymbol);
					updateElementValue(symbolParts[0]);
				}
			}

			// Bind event listeners for input interaction
			targetElement.on('keydown.currency_format', handleKeyPress);
			targetElement.on('keyup.currency_format', applyFormatting);
			targetElement.on('focusout.currency_format', applyFormatting);

			// Specific handling for stripping/adding leading symbol on focus/blur
			if(stripLeadingOnBlur)
			{
				targetElement.on('focusout.currency_format', function()
				{
					removeLeadingSymbol();
				});

				targetElement.on('focusin.currency_format', function()
				{
					attachLeadingSymbol();
				});
			}
			
			// Specific handling for stripping/adding trailing symbol on focus/blur
			if(stripTrailingOnBlur)
			{
				targetElement.on('focusout.currency_format', function()
				{
                    removeTrailingSymbol();
				});

				targetElement.on('focusin.currency_format', function()
				{
                    attachTrailingSymbol();
				});
			}

			// Initial formatting if the element already contains a value
			if (retrieveElementValue().length>0)
			{
				applyFormatting();
				removeLeadingSymbol();
                removeTrailingSymbol();
			}

		});

	};
	
	/*****************************
    * Deactivate Formatting Plugin *
    ******************************/
    jq.fn.disableCurrencyFormatter = function(){
      return jq(this).off(".currency_format");
    };

    /**************************
    * Extract Pure Numeric Value *
    ***************************/
    jq.fn.extractNumericValue = function(){

        var elementContent;
		var numericDigits = "";
		
		if(jq(this).is('input'))
			elementContent = jq(this).val();
		else
			elementContent = jq(this).html();

        for(var idx in elementContent)
        {
            if(!isNaN(elementContent[idx]) || elementContent[idx] == "-") numericDigits += elementContent[idx];
        }

        return numericDigits;
    };

})(jQuery);