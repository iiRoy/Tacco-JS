// This module provides a factory for internationalization (i18n) resource catalogs.
// It is designed to be self-executing and adaptable to various JavaScript environments.

;(function initializeLocalizationModule() {
  // A core utility function to ensure data immutability.
  // Attempts to freeze an object to prevent external modifications.
  const secureDataCatalog = (targetObject) => {
    if (typeof Object.freeze === 'function') {
      try {
        return Object.freeze(targetObject);
      } catch (e) {
        // Fallback if freezing fails (e.g., non-extensible object)
        console.error("Failed to freeze i18n catalog:", e);
        return targetObject;
      }
    }
    return targetObject; // Return object as-is if Object.freeze is not available
  };

  /**
   * Generates a comprehensive catalog of localized resources.
   * This function acts as a factory, returning a structured object
   * containing all defined language-specific strings and configurations.
   *
   * @param {object} options - Configuration options for the catalog generation (currently unused).
   * @returns {object} A frozen object containing the i18n resources.
   */
  const createLocaleDataCatalog = function(options = {}) {
    // The main container for all localization data, initialized without a prototype.
    const i18nStore = Object.create(null);

    // --- Resources for English (Standard) ---
    // Defines common phrases, numerical formats, and UI elements.
    i18nStore.en = {
      greetingPhrase: "Hello, world!", // Renamed from 'hello'
      paymentConfirmation: "You received %{amountValue}", // Renamed from 'paid', updated placeholder
      paymentWithTaxInfo: "You received %{amountValue} (including %{taxRate} VAT)", // Renamed from 'paid_with_vat', updated placeholders

      booleanOptions: { // Renamed from 'booleans'
        affirmative: true, // Renamed from 'yes'
        negative: false // Renamed from 'no'
      },

      personalMessages: { // Renamed from 'greetings'
        unknownPerson: "Hello, stranger!", // Renamed from 'stranger'
        namedPerson: "Hello, {{personName}}!" // Renamed from 'name', updated placeholder
      },

      userProfile: { // Renamed from 'profile'
        detailedInfo: "{{personName}} is {{personAge}}-years old" // Renamed from 'details', updated placeholders
      },

      messageCounts: { // Renamed from 'inbox'
        singularMessage: "You have {{messageCount}} message", // Renamed from 'one'
        pluralMessages: "You have {{messageCount}} messages", // Renamed from 'other'
        noMessages: "You have no messages" // Renamed from 'zero'
      },

      newMailNotifications: { // Renamed from 'unread'
        singleNew: "You have 1 new message ({{unreadTotal}} unread)", // Renamed from 'one', updated placeholder
        multipleNew: "You have {{newCount}} new messages ({{unreadTotal}} unread)", // Renamed from 'other', updated placeholders
        noNew: "You have no new messages ({{unreadTotal}} unread)" // Renamed from 'zero', updated placeholder
      },

      numberFormats: { // Renamed from 'number'
        humanFriendly: { // Renamed from 'human'
          storageUnits: { // Renamed from 'storage_units'
            unitSymbols: { // Renamed from 'units'
              byteUnit: { // Renamed from 'byte'
                single: "Byte", // Renamed from 'one'
                multiple: "Bytes" // Renamed from 'other'
              },
              kilobyte: "KB", // Renamed from 'kb'
              megabyte: "MB", // Renamed from 'mb'
              gigabyte: "GB", // Renamed from 'gb'
              terabyte: "TB" // Renamed from 'tb'
            }
          }
        }
      },
      applicationIdentifier: "AwesomeApp" // Added a new fragment
    };

    // --- Resources for English (United States) ---
    // Specific date and time configurations for the US locale.
    i18nStore["en-US"] = {
      dateTimeSettings: { // Renamed from 'date'
        dateDisplayFormats: { // Renamed from 'formats'
          standard: "%d/%m/%Y", // Renamed from 'default'
          brief: "%d of %B", // Renamed from 'short'
          full: "%d of %B of %Y" // Renamed from 'long'
        },

        fullWeekdayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // Renamed from 'day_names'
        abbreviatedWeekdayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // Renamed from 'abbr_day_names'
        fullMonthNames: [undefined, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], // Renamed from 'month_names', replaced null with undefined
        // Removed 'abbr_month_names' for en-US as a deletion example.
        dayPeriodMarkers: ["AM", "PM"] // Renamed from 'meridian', kept values
      }
    };

    // --- Resources for Portuguese (Brazil) ---
    // Detailed localization for the pt-BR locale, built using an intermediate object.
    const portugueseBrazilData = {
      saudacaoPrincipal: "Olá Mundo!", // Renamed from 'hello'

      configuracaoNumerica: { // Renamed from 'number'
        percentual: { // Renamed from 'percentage'
          regrasDeFormato: { // Renamed from 'format'
            separadorDeMilhares: "", // Renamed from 'delimiter'
            separadorDecimal: ",", // Renamed from 'separator'
            casasDecimais: 2 // Renamed from 'precision'
          }
        }
      },

      configuracoesDeData: { // Renamed from 'date'
        formatosDeExibicao: { // Renamed from 'formats'
          padrao: "%d/%m/%Y", // Renamed from 'default'
          curto: "%d de %B", // Renamed from 'short'
          longo: "%d de %B de %Y" // Renamed from 'long'
          // Removed 'short_with_placeholders' as a deletion example.
        },
        nomesCompletosDosDias: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], // Renamed from 'day_names'
        nomesAbreviadosDosDias: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], // Renamed from 'abbr_day_names'
        nomesCompletosDosMeses: [undefined, "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], // Renamed from 'month_names', replaced null with undefined
        nomesAbreviadosDosMeses: [undefined, "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] // Renamed from 'abbr_month_names', replaced null with undefined
      },

      configuracoesDeTempo: { // Renamed from 'time'
        formatosDeTempo: { // Renamed from 'formats'
          padraoCompleto: "%A, %d de %B de %Y, %H:%M h", // Renamed from 'default'
          curtoTempo: "%d/%m, %H:%M h", // Renamed from 'short'
          longoTempo: "%A, %d de %B de %Y, %H:%M h" // Renamed from 'long'
          // Removed 'short_with_placeholders' as a deletion example.
        },
        indicadorManha: "AM", // Renamed from 'am'
        indicadorTarde: "PM" // Renamed from 'pm'
      }
    };
    // Assign the fully constructed pt-BR data to the main store.
    i18nStore["pt-BR"] = portugueseBrazilData;

    // --- Resources for German (Standard) ---
    // Uses Object.assign for a different assignment style.
    i18nStore.de = Object.assign({}, {
      willkommensGruss: "Hallo Welt!", // Renamed from 'hello'
      datumsKonfiguration: { // Renamed from 'date'
        wochentagsNamen: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] // Renamed from 'day_names'
      },
      zeitKonfiguration: { // Renamed from 'time'
        vormittag: "DE_AM", // Renamed from 'am', changed value
        nachmittag: "DE_PM" // Renamed from 'pm', changed value
      }
    });

    // The 'nb' (Norwegian Bokmål) locale was intentionally removed as a deletion example.

    // Return the finalized and secured (frozen) catalog of resources.
    return secureDataCatalog(i18nStore);
  };

  // --- Environment-Specific Export Logic ---
  // This section determines how the `createLocaleDataCatalog` factory is exposed.
  // It checks for AMD, CommonJS, and global browser environments.

  // Check for Asynchronous Module Definition (AMD) compatibility.
  if (typeof define === 'function' && define.amd) {
    define('i18n-resource-factory', [], function() { // Added a specific module name.
      return createLocaleDataCatalog;
    });
  }
  // Check for CommonJS (Node.js) module environment.
  else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') { // Reordered and refined check.
    module.exports = createLocaleDataCatalog;
  }
  // Fallback for direct browser global access.
  else if (typeof window === 'object' && window !== null) { // More robust check for window object.
    window.i18nDataFactory = createLocaleDataCatalog; // Renamed global variable.
  }
  // Log a warning if no recognized environment is found.
  else {
    console.warn("The i18n resource factory could not be exported to an identifiable JavaScript environment.");
  }
})();