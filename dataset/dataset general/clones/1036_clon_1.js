/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the original source.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been extensively modified to create a visually different but
 * functionally identical version.
 */

var DEBUG = false; // A debug flag, currently set to false.

// This is an Immediately Invoked Function Expression (IIFE)
// It ensures that all variables declared inside are scoped locally.
; (function() {
  /*
   * The core logic for generating translation objects is encapsulated
   * within this 'generator' function.
   */
  var generator = function() {
    // Initialize an empty object to hold all translation data.
    var Translations = {};

    // Define English (en) translations.
    Translations.en = {
      hello: "Hello World!", // A simple greeting.

      // Example of a string with a single placeholder.
      paid: "You were paid %{price}",

      /*
       * Another example with multiple placeholders.
       * Note the comma starting the line, a valid JavaScript syntax.
       */
      paid_with_vat: "You were paid %{price} (incl. VAT %{vat})",

      // Nested object for boolean values.
      booleans: {
        yes: true,
        no: false
      },

      // Greetings with dynamic names.
      greetings: {
        stranger: "Hello stranger!", // For unknown users.
        name: "Hello {{name}}!" // For known users, with a placeholder.
      },

      // Profile details.
      profile: {
        details: "{{name}} is {{age}}-years old" // User's name and age.
      },

      // Inbox message counts, demonstrating pluralization rules (one, other, zero).
      inbox: {
        one: "You have {{count}} message",
        other: "You have {{count}} messages",
        zero: "You have no messages"
      },

      // Unread message counts, also with pluralization.
      unread: {
        one: "You have 1 new message ({{unread}} unread)",
        other: "You have {{count}} new messages ({{unread}} unread)",
        zero: "You have no new messages ({{unread}} unread)"
      },

      // Number formatting related translations.
      number: {
        human: {
          storage_units: {
            units: {
              "byte": {
                one: "Byte",
                other: "Bytes"
              },
              "kb": "KB",
              "mb": "MB",
              "gb": "GB",
              "tb": "TB"
            }
          }
        }
      }
    }; // End of English translations.


    // Define American English (en-US) specific translations, primarily for date formats.
    Translations["en-US"] = {
      date: {
        formats: {
          "default": "%d/%m/%Y", // Default date format.
          "short": "%d de %B", // Short date format.
          "long": "%d de %B de %Y" // Long date format.
        },

        day_names: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // Full day names.
        abbr_day_names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // Abbreviated day names.
        month_names: [null, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], // Full month names (null at index 0 for 1-based indexing).
        abbr_month_names: [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"], // Abbreviated month names.
        meridian: ["am", "pm"] // AM/PM indicators.
      }
    }; // End of en-US translations.


    // Define Brazilian Portuguese (pt-BR) translations.
    Translations["pt-BR"] = {
      hello: "Olá Mundo!", // Brazilian Portuguese greeting.

      // Number percentage formatting.
      number: {
        percentage: {
          format: {
            delimiter: "", // No thousands delimiter.
            separator: ",", // Decimal separator.
            precision: 2 // Two decimal places.
          }
        }
      },

      // Date formats and names for pt-BR.
      date: {
        formats: {
          "default": "%d/%m/%Y",
          "short": "%d de %B",
          "long": "%d de %B de %Y",
          "short_with_placeholders": "%d de %B {{p1}} {{p2}}" // Example with multiple placeholders.
        },
        day_names: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        abbr_day_names: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        month_names: [null, "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        abbr_month_names: [null, "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
      },

      // Time formats and indicators for pt-BR.
      time: {
        formats: {
          "default": "%A, %d de %B de %Y, %H:%M h",
          "short": "%d/%m, %H:%M h",
          "long": "%A, %d de %B de %Y, %H:%M h",
          "short_with_placeholders": "%d/%m, %H:%M h {{p1}}"
        },
        am: "AM", // AM indicator.
        pm: "PM" // PM indicator.
      }
    }; // End of pt-BR translations.


    // Define German (de) translations.
    Translations["de"] = {
      hello: "Hallo Welt!", // German greeting.
      date: {
        day_names: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] // German day names.
      },

      time: {
        am: "de:AM", // German-specific AM indicator.
        pm: "de:PM" // German-specific PM indicator.
      }
    }; // End of German translations.


    // Define Norwegian (nb) translations.
    Translations["nb"] = {
      hello: "Hei Verden!" // Norwegian greeting.
    }; // End of Norwegian translations.


    // The generator function returns the complete Translations object.
    return Translations;
  }; // End of generator function.

  /*
   * This block handles module export for different environments:
   * AMD (RequireJS), browser global, and CommonJS (Node.js).
   */
  if (typeof define === 'function' && define.amd) {
    // AMD environment: define the module.
    define(function() {
      return generator;
    });
  } else if (typeof(exports) === "undefined") {
    // Browser environment: expose 'generator' globally as 'window.Translations'.
    window.Translations = generator;
  } else {
    // CommonJS environment: export 'generator' as the module.
    module.exports = generator;
  }
})(); // End of IIFE.