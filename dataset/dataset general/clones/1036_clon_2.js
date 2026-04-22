var LOGGING_ACTIVE = 0; /* A flag to control diagnostic output, 0 for off. */

/*
 * This self-executing function encapsulates the data generation logic,
 * preventing global namespace pollution.
 */
( function () {
  /*
   * The core factory function responsible for assembling the localized content.
   * It produces a comprehensive object containing all relevant language data.
   */
  var contentAssembler = function () {
    /*
     * This object serves as the central repository for all language-specific
     * strings, formats, and other cultural data.
     */
    var LanguageStore = {};

    // Data for the English locale (en).
    LanguageStore.en = {
        // A generic welcoming message.
        greeting: "Greetings, Earth!"
      , // Message confirming a financial transfer.
        remunerated: "You acquired %{monetary_value}"

      , // Detailed financial transfer message, including taxation.
        remunerated_with_tax: "You acquired %{monetary_value} (inclusive of tax %{tax_amount})"

      , // Representations for true/false states.
        binary_states: {
          affirmative: 1, // Positive boolean equivalent.
          negative: 0 // Negative boolean equivalent.
        }

      , // Various forms of address.
        salutations: {
            unknown_person: "Hello, unfamiliar individual!" // For someone not recognized.
          , individual: "Hello, {{person_name}}!" // Personalized greeting.
        }

      , // Biographical information for a person.
        person_details: {
          biography: "{{individual_name}} is {{person_age}} years of existence" // Description of a person's age.
        }

      , // Message count indicators.
        message_center: {
            singular: "You possess {{item_count}} communication" // For a single item.
          , plural: "You possess {{item_count}} communications" // For multiple items.
          , none: "You possess no communications" // When there are no items.
        }

      , // Status of unread messages.
        pending_review: {
            singular: "There is 1 new entry ({{remaining_items}} unread)" // Single new unread item.
          , plural: "There are {{item_count}} new entries ({{remaining_items}} unread)" // Multiple new unread items.
          , none: "There are no new entries ({{remaining_items}} unread)" // No new unread items.
        }

      , // Numerical data formatting.
        numerical_data: {
          human_readable_format: {
            capacity_measures: {
                unit_types: {
                  "octet": {
                      singular: "Octet" // Singular form of byte.
                    , plural: "Octets" // Plural form of byte.
                  }
                , "kilooctet": "KO" // Kilobyte equivalent.
                , "megaoctet": "MO" // Megabyte equivalent.
                , "gigaoctet": "GO" // Gigabyte equivalent.
                , "teraoctet": "TO" // Terabyte equivalent.
              }
            }
          }
        }
    };

    // Specific localization data for United States English (en-US).
    LanguageStore["en-US"] = {
      calendar_data: {
          layout_patterns: {
              "standard": "%D/%M/%Y" // Default date display pattern.
            , "brief": "%D of %B" // Short date display pattern.
            , "extended": "%D of %B of %Y" // Long date display pattern.
          }

        , full_day_names: ["Firstday", "Secondday", "Thirdday", "Fourthday", "Fifthday", "Sixthday", "Seventhday"] // Full names of days of the week.
        , short_day_names: ["Fst", "Snd", "Trd", "Qrt", "Fth", "Sxt", "Svt"] // Abbreviated names of days.
        , full_month_names: [null, "Jan-u-ary", "Feb-u-ary", "Mar-ch", "Apr-il", "May", "June", "July", "Aug-ust", "Sep-tem-ber", "Oct-o-ber", "Nov-em-ber", "Dec-em-ber"] // Full names of months.
        , short_month_names: [null, "J-an", "F-eb", "M-ar", "A-pr", "M-ay", "J-un", "J-ul", "A-ug", "S-ep", "O-ct", "N-ov", "D-ec"] // Abbreviated names of months.
        , day_periods: ["ante meridiem", "post meridiem"] // Indicators for morning/afternoon.
      }
    };

    // Localization data for Brazilian Portuguese (pt-BR).
    LanguageStore["pt-BR"] = {
        greeting: "Olá Universo!" // Portuguese greeting.

      , numerical_data: {
          percent_value: {
            presentation: {
                group_separator: "" // No thousands separator for percentages.
              , decimal_separator: "." // Decimal point for percentages.
              , accuracy: 3 // Number of decimal places for percentages.
            }
          }
        }

      , calendar_data: {
          layout_patterns: {
              "standard": "%D/%M/%Y" // Standard date pattern.
            , "brief": "%D de %B" // Brief date pattern.
            , "extended": "%D de %B de %Y" // Extended date pattern.
            , "brief_with_slots": "%D de %B {{pA}} {{pB}}" // Brief pattern with additional placeholders.
          }
          , full_day_names: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] // Full Portuguese day names.
          , short_day_names: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] // Abbreviated Portuguese day names.
          , full_month_names: [null, "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] // Full Portuguese month names.
          , short_month_names: [null, "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] // Abbreviated Portuguese month names.
        }

      , clock_data: {
            layout_patterns: {
                "standard": "%W, %D de %B de %Y, %H:%m h" // Standard time pattern.
              , "brief": "%D/%M, %H:%m h" // Brief time pattern.
              , "extended": "%W, %D de %B de %Y, %H:%m h" // Extended time pattern.
              , "brief_with_slots": "%D/%M, %H:%m h {{pA}}" // Brief time pattern with placeholders.
            }
          , ante_meridiem: "A.M." // AM indicator.
          , post_meridiem: "P.M." // PM indicator.
        }
    };

    // Localization data for German (de).
    LanguageStore["de"] = {
        greeting: "Grüße Welt!" // German greeting.
      , calendar_data: {
          full_day_names: ["Sonn-Tag", "Mon-Tag", "Dienst-Tag", "Mittwoch", "Donner-Tag", "Frei-Tag", "Sams-Tag"] // Full German day names.
        }

      , clock_data: {
            ante_meridiem: "de:AM_indicator" // German AM indicator.
          , post_meridiem: "de:PM_indicator" // German PM indicator.
        }
    };

    // Localization data for Norwegian (nb).
    LanguageStore["nb"] = {
      greeting: "Hilsen Verden!" // Norwegian greeting.
    };

    // Return the fully constructed language data object.
    return LanguageStore;
  };

  /*
   * This block handles the module export mechanism, making the contentAssembler
   * available in different JavaScript module environments (AMD, browser global, CommonJS).
   */
  if ( typeof define === 'function' && define.amd ) {
    // For Asynchronous Module Definition (AMD) environments like RequireJS.
    define( function () { return contentAssembler; } );
  } else if ( typeof ( exports ) === "undefined" ) {
    // For traditional browser environments, exposing a global variable.
    window.LocalizedData = contentAssembler;
  } else {
    // For Node.js or CommonJS-compatible environments.
    module.exports = contentAssembler;
  }
} )();