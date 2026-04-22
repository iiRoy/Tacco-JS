/**
 * Copyright (c) 2008, Steven Chim
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     * The names of its contributors may not be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * This file is a Type III clone of the original, with structural and semantic variations
 * while retaining core functionality.
 */

// Ensure ExtJS framework components are available, using modern Ext.define for clarity where possible.
// For older ExtJS versions, Ext.extend is used as in the original, but with updated syntax and structure.

/***
 * Core Interaction Logic for Input Controls
 * This acts as the base behavior for various spinner types.
 */
Ext.define('Ext.app.form.SpinControlBase', {
    extend: 'Ext.util.Observable', // Inherit from Observable for event handling

    // Default configuration properties
    initialValue: 0,
    minimumBound: undefined,
    maximumBound: undefined,
    stepMagnitude: 1,
    altStepMagnitude: 5,
    // Task to delay validation on the bound field
    pendingValidationTask: null,
    // Optional flag to control if boundary checks are active
    enableBoundaryChecks: true,

    /**
     * Constructor for the base spin control.
     * @param {Object} config Configuration object to apply.
     */
    constructor: function(config) {
        this.callParent(arguments); // Call parent constructor (Observable)
        // Apply configuration properties to this instance.
        // Using Object.assign for a more modern JS approach than Ext.apply.
        Object.assign(this, config);

        // Initialize the delayed task for validation.
        // This task is now an instance property, allowing for more flexible setup.
        this.pendingValidationTask = new Ext.util.DelayedTask(function(targetFieldRef) {
            if (targetFieldRef && typeof targetFieldRef.validate === 'function') {
                targetFieldRef.validate();
            } else {
                // Log a warning if validation target is invalid or missing
                Ext.log.warn('SpinControlBase: Validation target field is invalid or missing.');
            }
        });
    },

    /**
     * Handles an increment action (spin up).
     * @param {Ext.form.field.Base} targetField The form field to operate on.
     */
    handleIncrementAction: function(targetField) {
        this.performSpinOperation(targetField, false, false);
    },

    /**
     * Handles a decrement action (spin down).
     * @param {Ext.form.field.Base} targetField The form field to operate on.
     */
    handleDecrementAction: function(targetField) {
        this.performSpinOperation(targetField, true, false);
    },

    /**
     * Handles an alternate increment action (shift-spin up).
     * @param {Ext.form.field.Base} targetField The form field to operate on.
     */
    handleAltIncrementAction: function(targetField) {
        this.performSpinOperation(targetField, false, true);
    },

    /**
     * Handles an alternate decrement action (shift-spin down).
     * @param {Ext.form.field.Base} targetField The form field to operate on.
     */
    handleAltDecrementAction: function(targetField) {
        this.performSpinOperation(targetField, true, true);
    },

    /**
     * The core method to apply a spin operation.
     * This method is intended to be overridden by concrete strategies.
     * @param {Ext.form.field.Base} targetField The field being spun.
     * @param {boolean} isDecrement True for decrement, false for increment.
     * @param {boolean} useAlternateStep True to use alternate step, false for normal.
     */
    performSpinOperation: function(targetField, isDecrement, useAlternateStep) {
        // Schedule validation for the field after a short delay.
        // This ensures validation runs after the value has been set.
        this.pendingValidationTask.delay(500, null, null, [targetField]);
        // Concrete strategies will implement the actual value manipulation here.
        // This base method serves as a hook for common tasks like validation scheduling.
    },

    /**
     * Abstract method to constrain a value within defined boundaries.
     * @param {*} rawValue The value to constrain.
     * @returns {*} The constrained value.
     */
    constrainValueToLimits: function(rawValue) {
        // This method should be overridden by subclasses.
        // For the base, it just returns the value as-is.
        return rawValue;
    }
});

/***
 * Concrete Strategy: Numeric Input Handler
 * Extends the base spin control for handling numerical values.
 */
Ext.define('Ext.app.form.NumericSpinControl', {
    extend: 'Ext.app.form.SpinControlBase', // Inherit from our custom base class

    // Numeric-specific properties
    permitDecimalPoints: true,
    decimalPlacesCount: 2,

    /**
     * Overrides the base performSpinOperation to handle numeric calculations.
     * @param {Ext.form.field.Base} targetField The field being spun.
     * @param {boolean} isDecrement True for decrement, false for increment.
     * @param {boolean} useAlternateStep True to use alternate step, false for normal.
     */
    performSpinOperation: function(targetField, isDecrement, useAlternateStep) {
        // Call the parent's spin operation for common tasks like validation scheduling.
        this.callParent(arguments);

        if (!targetField) {
            Ext.log.warn('NumericSpinControl: Target field is null or undefined.');
            return;
        }

        // Retrieve current value, ensuring it's treated as a number.
        let currentValue = Number(targetField.getValue());

        // Handle NaN values, defaulting to initialValue if current value is not a number.
        if (Number.isNaN(currentValue)) {
            currentValue = Number(this.initialValue);
            // If initialValue is also NaN, default to 0.
            if (Number.isNaN(currentValue)) {
                currentValue = 0;
            }
        }

        // Determine the step magnitude (normal or alternate).
        const currentStep = useAlternateStep ? this.altStepMagnitude : this.stepMagnitude;

        // Apply increment or decrement.
        let updatedValue;
        if (isDecrement) {
            updatedValue = currentValue - currentStep;
        } else {
            updatedValue = currentValue + currentStep;
        }

        // Constrain the updated value within defined boundaries and precision.
        const finalValue = this.constrainValueToLimits(updatedValue);

        // Set the raw value back to the field.
        targetField.setRawValue(finalValue);
    },

    /**
     * Overrides the base method to apply numeric boundary checks and precision formatting.
     * @param {number} inputVal The numeric value to constrain.
     * @returns {number} The constrained and precision-fixed numeric value.
     */
    constrainValueToLimits: function(inputVal) {
        let constrainedVal = inputVal;

        // Only apply boundary checks if enabled
        if (this.enableBoundaryChecks) {
            // Check against minimum bound
            if (this.minimumBound !== undefined && constrainedVal < this.minimumBound) {
                constrainedVal = this.minimumBound;
            }
            // Check against maximum bound
            if (this.maximumBound !== undefined && constrainedVal > this.maximumBound) {
                constrainedVal = this.maximumBound;
            }
        }

        // Apply precision fixing
        return this.adjustToPrecision(constrainedVal);
    },

    /**
     * Private helper method to adjust a number to the specified decimal precision.
     * @private
     * @param {number} valueToFix The number to adjust.
     * @returns {number|string} The number adjusted to precision, or an empty string if NaN.
     */
    adjustToPrecision: function(valueToFix) {
        const isNaNVal = Number.isNaN(valueToFix);

        // If decimals are not allowed, precision is negative, or value is invalid,
        // return as is (or empty string for NaN).
        if (!this.permitDecimalPoints || this.decimalPlacesCount < 0 || isNaNVal || valueToFix === null || valueToFix === undefined) {
            return isNaNVal ? '' : valueToFix;
        }

        // Use toFixed and then parseFloat to ensure proper rounding and numeric type.
        // Adding a small epsilon before toFixed can sometimes prevent floating point issues.
        const epsilon = 1e-9; // Small number to handle floating point inaccuracies
        const fixedString = (valueToFix + (valueToFix > 0 ? epsilon : -epsilon)).toFixed(this.decimalPlacesCount);
        return parseFloat(fixedString);
    }
});

/***
 * Concrete Strategy: Date Input Handler
 * Extends the base spin control for handling date values.
 */
Ext.define('Ext.app.form.DateSpinControl', {
    extend: 'Ext.app.form.SpinControlBase', // Inherit from our custom base class

    // Date-specific properties, using Ext.Date constants
    initialDate: new Date(), // Default to current date
    displayFormat: "Y-m-d", // Default date format
    dateStepValue: 1,
    dateStepUnit: Ext.Date.DAY, // Default step unit is a day
    altDateStepValue: 1,
    altDateStepUnit: Ext.Date.MONTH, // Alternate step unit is a month

    /**
     * Overrides the base performSpinOperation to handle date calculations.
     * @param {Ext.form.field.Base} targetField The field being spun.
     * @param {boolean} isDecrement True for decrement, false for increment.
     * @param {boolean} useAlternateStep True to use alternate step, false for normal.
     */
    performSpinOperation: function(targetField, isDecrement, useAlternateStep) {
        // Call the parent's spin operation for common tasks like validation scheduling.
        this.callParent(arguments);

        if (!targetField) {
            Ext.log.warn('DateSpinControl: Target field is null or undefined.');
            return;
        }

        const rawFieldValue = targetField.getRawValue();
        let currentParsedDate = Ext.Date.parse(rawFieldValue, this.displayFormat);

        // Determine the direction of the operation.
        const directionFactor = isDecrement ? -1 : 1;

        // Select the appropriate step value and unit.
        const effectiveStepValue = useAlternateStep ? this.altDateStepValue : this.dateStepValue;
        const effectiveStepUnit = useAlternateStep ? this.altDateStepUnit : this.dateStepUnit;

        // Ensure initialDate is a Date object if it was configured as a string.
        if (typeof this.initialDate === 'string') {
            this.initialDate = Ext.Date.parse(this.initialDate, this.displayFormat);
            if (!this.initialDate) {
                Ext.log.error('DateSpinControl: Failed to parse initialDate string. Using current date.');
                this.initialDate = new Date();
            }
        }

        // If current date couldn't be parsed, use the initial date.
        if (!currentParsedDate) {
            currentParsedDate = this.initialDate;
            Ext.log.info('DateSpinControl: Could not parse field value, defaulting to initialDate.');
        }

        // Apply the date addition/subtraction.
        let modifiedDate = Ext.Date.add(currentParsedDate, effectiveStepUnit, directionFactor * effectiveStepValue);

        // Apply boundary checks.
        const finalDate = this.constrainValueToLimits(modifiedDate);

        // Format the final date back into a string for the field.
        targetField.setRawValue(Ext.Date.format(finalDate, this.displayFormat));
    },

    /**
     * Overrides the base method to apply date boundary checks.
     * @param {Date} dateToConstrain The Date object to constrain.
     * @returns {Date} The constrained Date object.
     */
    constrainValueToLimits: function(dateToConstrain) {
        let constrainedDate = dateToConstrain;

        // Only apply boundary checks if enabled
        if (!this.enableBoundaryChecks) {
            return constrainedDate;
        }

        // Parse min/max values if they are strings. Cache them if they are properties.
        let minDateObj = null;
        if (this.minimumBound instanceof Date) {
            minDateObj = this.minimumBound;
        } else if (typeof this.minimumBound === 'string') {
            minDateObj = Ext.Date.parse(this.minimumBound, this.displayFormat);
            if (!minDateObj) Ext.log.warn('DateSpinControl: Failed to parse minimumBound string.');
        }

        let maxDateObj = null;
        if (this.maximumBound instanceof Date) {
            maxDateObj = this.maximumBound;
        } else if (typeof this.maximumBound === 'string') {
            maxDateObj = Ext.Date.parse(this.maximumBound, this.displayFormat);
            if (!maxDateObj) Ext.log.warn('DateSpinControl: Failed to parse maximumBound string.');
        }

        // Apply minimum bound check
        if (minDateObj && constrainedDate.getTime() < minDateObj.getTime()) {
            constrainedDate = minDateObj;
        }
        // Apply maximum bound check
        if (maxDateObj && constrainedDate.getTime() > maxDateObj.getTime()) {
            constrainedDate = maxDateObj;
        }

        return constrainedDate;
    }
});


/***
 * Concrete Strategy: Time Input Handler
 * Extends the DateSpinControl for handling time values.
 */
Ext.define('Ext.app.form.TimeSpinControl', {
    extend: 'Ext.app.form.DateSpinControl', // Inherit from DateSpinControl

    // Time-specific properties, overriding date properties
    initialDate: new Date(2000, 0, 1, 0, 0, 0), // Default to a base time (e.g., midnight)
    displayFormat: "H:i", // Time format (e.g., 23:59)

    // Time-specific step values and units
    dateStepValue: 1, // Renamed from incrementValue for clarity
    dateStepUnit: Ext.Date.MINUTE, // Step by minutes
    altDateStepValue: 1, // Renamed from alternateIncrementValue
    altDateStepUnit: Ext.Date.HOUR // Alternate step by hours
});

// Alias the classes for easier access, similar to original Ext.ux.form.Spinner
Ext.namespace('Ext.ux.form.Spinner');
Ext.ux.form.Spinner.Strategy = Ext.app.form.SpinControlBase;
Ext.ux.form.Spinner.NumberStrategy = Ext.app.form.NumericSpinControl;
Ext.ux.form.Spinner.DateStrategy = Ext.app.form.DateSpinControl;
Ext.ux.form.Spinner.TimeStrategy = Ext.app.form.TimeSpinControl;