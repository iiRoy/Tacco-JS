/*
 * Copyright (c) 2008, Steven Chim
 * All rights reserved.
 *
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 *     * The names of its contributors may not be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

//
// Abstract Strategy for Spinner components.
// This defines the base behavior and interface for spinner field interactions.
//
Ext.ux.form.Spinner.Strategy = function ( config ) {

	// Apply configuration properties to this instance during construction.
	Ext.apply( this, config );

}; // End of Ext.ux.form.Spinner.Strategy constructor definition

Ext.extend(
    Ext.ux.form.Spinner.Strategy,
    Ext.util.Observable,
    {
        // Default value to be used when the spinner field is empty or invalid.
        defaultValue          : 0,

        // Minimum allowed value for the spinner. Can be left undefined for no minimum.
        minValue              : undefined,

        // Maximum allowed value for the spinner. Can be left undefined for no maximum.
        maxValue              : undefined,

        // The standard step value for incrementing or decrementing.
        incrementValue        : 1,

        // An alternative step value, often used with a modifier key (e.g., Shift).
        alternateIncrementValue : 5,

        // A delayed task used to trigger field validation after a spin operation.
        validationTask        : new Ext.util.DelayedTask(),


        /**
         * Handles the "spin up" action. This typically increases the field's value.
         * @param {Ext.form.Field} field The form field associated with the spinner.
         */
        onSpinUp : function ( field ) {
            // Delegate to the general spin method: not spinning down, not alternate.
            this.spin( field, false, false );
        },


        /**
         * Handles the "spin down" action. This typically decreases the field's value.
         * @param {Ext.form.Field} field The form field associated with the spinner.
         */
        onSpinDown : function ( field ) {
            // Delegate to the general spin method: spinning down, not alternate.
            this.spin( field, true, false );
        },


        /**
         * Handles the "alternate spin up" action. Uses the alternate increment value.
         * @param {Ext.form.Field} field The form field associated with the spinner.
         */
        onSpinUpAlternate : function ( field ) {
            // Delegate to the general spin method: not spinning down, alternate.
            this.spin( field, false, true );
        },


        /**
         * Handles the "alternate spin down" action. Uses the alternate increment value.
         * @param {Ext.form.Field} field The form field associated with the spinner.
         */
        onSpinDownAlternate : function ( field ) {
            // Delegate to the general spin method: spinning down, alternate.
            this.spin( field, true, true );
        },


        /**
         * The core method for performing a spin operation.
         * This method is intended to be overridden by concrete strategy implementations.
         * @param {Ext.form.Field} field The form field to modify.
         * @param {boolean} down `true` if the spin direction is down, `false` for up.
         * @param {boolean} alternate `true` if the alternate increment value should be used.
         */
        spin : function ( field, down, alternate ) {
            // Schedule a validation task to run after a short delay (500ms).
            // This prevents excessive validation calls during rapid spinning.
            this.validationTask.delay( 500, function () {
                // Ensure the field object still exists before attempting to validate.
                if ( field != undefined ) {
                    field.validate();
                }
            });
            // Subclasses will implement the actual value modification logic here.
            // This base method primarily handles the validation scheduling.
        },


        /**
         * A placeholder method for enforcing value boundaries (min/max).
         * This method must be overridden by concrete strategy implementations.
         * @param {any} value The value to be checked and potentially adjusted.
         * @returns {any} The value, potentially adjusted to fit within boundaries.
         */
        fixBoundries : function ( value ) {
            // The default implementation simply returns the input value without modification.
            // Concrete strategies will implement specific boundary logic for their data type.
            return value;
            // This method serves as an extension point for type-specific boundary enforcement.
        }

    }
); // End of Ext.extend for Ext.ux.form.Spinner.Strategy

//
// Concrete Strategy for Numbers.
// This strategy handles spinning behavior for numeric input fields.
//
Ext.ux.form.Spinner.NumberStrategy = function ( config ) {
	// Call the constructor of the superclass (Ext.ux.form.Spinner.Strategy)
	// to ensure proper initialization of inherited properties.
	Ext.ux.form.Spinner.NumberStrategy.superclass.constructor.call( this, config );
}; // End of NumberStrategy constructor definition

Ext.extend(
    Ext.ux.form.Spinner.NumberStrategy,
    Ext.ux.form.Spinner.Strategy,
    {

        // Specifies whether decimal values are permitted.
        allowDecimals    : true,

        // Defines the number of decimal places to maintain for numeric values.
        decimalPrecision : 2,


        /**
         * Overrides the base `spin` method to provide number-specific increment/decrement logic.
         * @param {Ext.form.Field} field The numeric form field.
         * @param {boolean} down `true` for decrement, `false` for increment.
         * @param {boolean} alternate `true` to use the alternate increment value.
         */
        spin : function ( field, down, alternate ) {
            // Call the superclass's spin method to handle common tasks, like deferred validation.
            Ext.ux.form.Spinner.NumberStrategy.superclass.spin.call( this, field, down, alternate );

            // Retrieve the current value from the field and parse it as a floating-point number.
            var v = parseFloat( field.getValue() );

            // Determine the increment amount based on whether the alternate flag is set.
            var incr = ( alternate == true ) ? this.alternateIncrementValue : this.incrementValue;

            // Apply the increment or decrement operation to the value `v`.
            ( down == true ) ? v -= incr : v += incr ;

            // If the calculated value is Not-a-Number (NaN), revert to the `defaultValue`.
            v = ( isNaN( v ) ) ? this.defaultValue : v;

            // Apply boundary checks (min/max) and precision fixing to the value.
            v = this.fixBoundries( v );

            // Update the raw value of the field with the new, adjusted numeric value.
            field.setRawValue( v );
        },


        /**
         * Overrides the base `fixBoundries` method to implement numeric boundary checks.
         * @param {number} value The numeric value to validate against boundaries.
         * @returns {number} The value, adjusted to be within `minValue` and `maxValue`.
         */
        fixBoundries : function ( value ) {
            var v = value;

            // If a minimum value is defined and the current value is less than it, adjust to `minValue`.
            if ( this.minValue != undefined && v < this.minValue ) {
                v = this.minValue;
            }

            // If a maximum value is defined and the current value is greater than it, adjust to `maxValue`.
            if ( this.maxValue != undefined && v > this.maxValue ) {
                v = this.maxValue;
            }

            // After boundary adjustments, ensure the value adheres to the specified decimal precision.
            return this.fixPrecision( v );
        },


        // private
        /**
         * Ensures that a numeric value adheres to the configured `decimalPrecision`.
         * @param {number} value The number whose precision needs to be fixed.
         * @returns {number|string} The number with corrected precision, or an empty string if NaN.
         */
        fixPrecision : function ( value ) {
            var nan = isNaN( value ); // Check if the value is Not-a-Number.

            // If decimals are not allowed, or precision is explicitly -1, or the value is NaN/falsy,
            // return the value as is (or an empty string if it was NaN).
            if ( !this.allowDecimals || this.decimalPrecision == -1 || nan || !value ) {
                return nan ? '' : value;
            }

            // Convert the number to a string with fixed decimal places, then parse back to a float.
            // This helps in handling floating-point inaccuracies and standardizes precision.
            return parseFloat( parseFloat( value ).toFixed( this.decimalPrecision ) );
        }

    }
); // End of Ext.extend for Ext.ux.form.Spinner.NumberStrategy

//
// Concrete Strategy for Dates.
// This strategy provides spinning functionality for date input fields.
//
Ext.ux.form.Spinner.DateStrategy = function ( config ) {
	// Call the constructor of the superclass (Ext.ux.form.Spinner.Strategy)
	// to ensure proper initialization of all inherited properties.
	Ext.ux.form.Spinner.DateStrategy.superclass.constructor.call( this, config );
}; // End of DateStrategy constructor definition

Ext.extend(
    Ext.ux.form.Spinner.DateStrategy,
    Ext.ux.form.Spinner.Strategy,
    {
        // The default date value to use when the field is empty or invalid.
        defaultValue             : new Date(),

        // The date format string used for parsing and displaying dates (e.g., "Y-m-d").
        format                   : "Y-m-d",

        // The standard step value for incrementing/decrementing date parts.
        incrementValue           : 1,

        // The Ext.Date constant representing the unit for standard increments (e.g., Date.DAY).
        incrementConstant        : Date.DAY,

        // An alternative step value, typically used with a modifier key.
        alternateIncrementValue  : 1,

        // The Ext.Date constant representing the unit for alternate increments (e.g., Date.MONTH).
        alternateIncrementConstant : Date.MONTH,


        /**
         * Overrides the base `spin` method to implement date-specific increment/decrement logic.
         * @param {Ext.form.Field} field The date form field.
         * @param {boolean} down `true` for decrement, `false` for increment.
         * @param {boolean} alternate `true` to use the alternate increment value and constant.
         */
        spin : function ( field, down, alternate ) {
            // Call the superclass's spin method. Note: The original code does not pass field/down/alternate here.
            Ext.ux.form.Spinner.DateStrategy.superclass.spin.call( this );

            // Get the raw string value from the field.
            var v = field.getRawValue();

            // Parse the raw string value into an Ext.Date object using the specified format.
            v = Date.parseDate( v, this.format );

            // Determine the direction multiplier: -1 for down, 1 for up.
            var dir = ( down == true ) ? -1 : 1 ;

            // Select the appropriate increment value based on the `alternate` flag.
            var incr = ( alternate == true ) ? this.alternateIncrementValue : this.incrementValue;

            // Select the appropriate date constant (e.g., Date.DAY, Date.MONTH) based on `alternate`.
            var dtconst = ( alternate == true ) ? this.alternateIncrementConstant : this.incrementConstant;

            // If `defaultValue` is initially a string, parse it into a Date object once.
            if ( typeof this.defaultValue == 'string' ) {
                this.defaultValue = Date.parseDate( this.defaultValue, this.format );
            }

            // Add/subtract the increment to the date. If `v` is null (parsing failed), use `defaultValue`.
            v = ( v ) ? v.add( dtconst, dir * incr ) : this.defaultValue;

            // Apply boundary checks (min/max date) to the new date value.
            v = this.fixBoundries( v );

            // Format the boundary-fixed date back into a string and set it to the field.
            field.setRawValue( Ext.util.Format.date( v, this.format ) );
        },


        // private
        /**
         * Overrides the base `fixBoundries` method to implement date-specific boundary checks.
         * @param {Date} date The date object to validate against boundaries.
         * @returns {Date} The date, adjusted to be within `minValue` and `maxValue` dates.
         */
        fixBoundries : function ( date ) {
            var dt = date;

            // Parse `minValue` and `maxValue` strings into Date objects if they are defined as strings.
            var min = ( typeof this.minValue == 'string' ) ? Date.parseDate( this.minValue, this.format ) : this.minValue ;
            var max = ( typeof this.maxValue == 'string' ) ? Date.parseDate( this.maxValue, this.format ) : this.maxValue ;

            // If a minimum date is defined and the current date is before it, adjust to `min`.
            if ( this.minValue != undefined && dt < min ) {
                dt = min;
            }

            // If a maximum date is defined and the current date is after it, adjust to `max`.
            if ( this.maxValue != undefined && dt > max ) {
                dt = max;
            }

            // Return the date after applying any boundary adjustments.
            return dt;
        }

    }
); // End of Ext.extend for Ext.ux.form.Spinner.DateStrategy

//
// Concrete Strategy for Time.
// This strategy extends the DateStrategy to provide time-specific spinning behavior.
//
Ext.ux.form.Spinner.TimeStrategy = function ( config ) {
	// Call the constructor of the superclass (Ext.ux.form.Spinner.DateStrategy)
	// to inherit all date-related properties and methods.
	Ext.ux.form.Spinner.TimeStrategy.superclass.constructor.call( this, config );
}; // End of TimeStrategy constructor definition

Ext.extend(
    Ext.ux.form.Spinner.TimeStrategy,
    Ext.ux.form.Spinner.DateStrategy,
    {
        // The time format string used for parsing and displaying time values (e.g., "H:i").
        format                     : "H:i",

        // The standard step value for incrementing/decrementing time parts (e.g., 1 minute).
        incrementValue             : 1,

        // The Ext.Date constant representing the unit for standard time increments (e.g., Date.MINUTE).
        incrementConstant          : Date.MINUTE,

        // An alternative step value for time, often used with a modifier key (e.g., 1 hour).
        alternateIncrementValue    : 1,

        // The Ext.Date constant representing the unit for alternate time increments (e.g., Date.HOUR).
        alternateIncrementConstant : Date.HOUR
    }
); // End of Ext.extend for Ext.ux.form.Spinner.TimeStrategy