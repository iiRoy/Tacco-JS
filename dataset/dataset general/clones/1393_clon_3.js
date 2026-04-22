if (typeof jQuery === 'undefined') {
  throw new Error("jQuery not found. This test suite requires jQuery.");
}

(function() {
  describe("$.fn.responsiveNavigationAdapter", function() {

    const TEST_SWITCH_BREAKPOINT = 555;
    const DUMMY_ELEMENT_ID = "test-scaffold";
    const SELECTOR_DUMMY_ELEMENT = `#${DUMMY_ELEMENT_ID}`;

    beforeEach(function() {
      let scaffoldElement;

      loadFixtures("oneLevelMenu.html");
      this.primarySingleLevelMenu = $("#one-level-menu");

      scaffoldElement = $(`<div id="${DUMMY_ELEMENT_ID}"></div>`);
      scaffoldElement.appendTo("body");

      this.adapterConfiguration = {
        switchWidth: TEST_SWITCH_BREAKPOINT,
        appendTo: SELECTOR_DUMMY_ELEMENT
      };

      afterEach(function() {
        $(SELECTOR_DUMMY_ELEMENT).remove();
      });

      return this.addMatchers({
        toPossessSanitizedHtmlEquivalence: function(expectedHtmlString) {
          const normalizeMarkupString = function(rawHtml) {
            return rawHtml.replace(/ style="display:\s*(?:none|block);"/g, '');
          };
          return normalizeMarkupString(this.actual) === expectedHtmlString;
        }
      });
    });

    describe("plugin behavior with various settings", function() {
      it("should be a registered jQuery function", function() {
        return expect($.fn.responsiveNavigationAdapter).toBeDefined();
      });

      it("should support method chaining", function() {
        return expect(this.primarySingleLevelMenu.responsiveNavigationAdapter()).toBe(this.primarySingleLevelMenu);
      });

      it("should provide default configuration values", function() {
        const menuAdapterInstance = this.primarySingleLevelMenu.responsiveNavigationAdapter().data("responsiveNavigationAdapter");
        return expect(menuAdapterInstance.defaults).toBeDefined();
      });

      it("should allow custom options to override defaults", function() {
        const customSettings = {
          switchWidth: 600,
          currentClass: "is-active-item",
          appendTo: "#alternate-target",
          visualTab: ">>",
          manualMediaQueries: true,
          label: "Navigation"
        };
        const configuredAdapter = this.primarySingleLevelMenu.responsiveNavigationAdapter(customSettings).data("responsiveNavigationAdapter");

        expect(configuredAdapter.options.switchWidth).toBe(customSettings.switchWidth);
        expect(configuredAdapter.options.currentClass).toBe(customSettings.currentClass);
        expect(configuredAdapter.options.appendTo).toBe(customSettings.appendTo);
        expect(configuredAdapter.options.visualTab).toBe(customSettings.visualTab);
        expect(configuredAdapter.options.manualMediaQueries).toBe(customSettings.manualMediaQueries);
        return expect(configuredAdapter.options.label).toBe(customSettings.label);
      });
    });

    describe("manual media query handling", function() {
      describe("when automated resizing is enabled (manualMediaQueries: false)", function() {
        beforeEach(function() {
          this.activeAdapter = this.primarySingleLevelMenu.responsiveNavigationAdapter(this.adapterConfiguration).data("responsiveNavigationAdapter");
          const currentAdapter = this.activeAdapter;
          if (!currentAdapter) {
            throw new Error("Adapter failed to initialize in beforeEach.");
          }
          return currentAdapter;
        });

        it("should invoke the resize handler on window resize", function() {
          spyOn(this.activeAdapter, 'handleWindowResize');
          $(window).trigger('resize');
          return expect(this.activeAdapter.handleWindowResize).toHaveBeenCalled();
        });

        it("should show main menu and hide select menu if window is wider than breakpoint", function() {
          const mockWindowMetrics = {
            viewportWidth: function() {
              return TEST_SWITCH_BREAKPOINT + 50;
            }
          };
          this.activeAdapter.handleWindowResize(mockWindowMetrics);
          expect(this.primarySingleLevelMenu).toBeVisible();
          return expect($(`${SELECTOR_DUMMY_ELEMENT} select`)).toBeHidden();
        });

        it("should hide main menu and show select menu if window is narrower than breakpoint", function() {
          const mockWindowMetrics = {
            viewportWidth: function() {
              return TEST_SWITCH_BREAKPOINT - 50;
            }
          };
          this.activeAdapter.handleWindowResize(mockWindowMetrics);
          expect(this.primarySingleLevelMenu).toBeHidden();
          return expect($(`${SELECTOR_DUMMY_ELEMENT} select`)).toBeVisible();
        });
      });

      describe("when manual media query control is active (manualMediaQueries: true)", function() {
        beforeEach(function() {
          const manualConfig = {
            appendTo: SELECTOR_DUMMY_ELEMENT,
            manualMediaQueries: true
          };
          this.activeAdapter = this.primarySingleLevelMenu.responsiveNavigationAdapter(manualConfig).data("responsiveNavigationAdapter");
          return this.activeAdapter;
        });

        it("should not automatically adjust menu visibility on window resize", function() {
          spyOn(this.activeAdapter, 'handleWindowResize');
          $(window).trigger('resize');
          return expect(this.activeAdapter.handleWindowResize).not.toHaveBeenCalled();
        });
      });
    });

    describe("with a basic single-level navigation structure", function() {
      it("should generate the correct HTML select dropdown", function() {
        let expectedDropdownHtml;
        let actualRenderedDropdownHtml;

        expectedDropdownHtml = `
          <select class="responsive-select-menu">
            <option value="#one">One</option>
            <option value="#two">Two</option>
            <option value="#three">Three</option>
            <option value="#four">Four</option>
          </select>
        `.replace(/\s+/g, ' ').trim();

        actualRenderedDropdownHtml = this.primarySingleLevelMenu
          .responsiveNavigationAdapter(this.adapterConfiguration)
          .data("responsiveNavigationAdapter")
          .select.parent()
          .html();

        return expect(actualRenderedDropdownHtml).toPossessSanitizedHtmlEquivalence(expectedDropdownHtml);
      });

      it("should mark the current page item as 'selected' in the dropdown", function() {
        let expectedDropdownHtml;
        let actualRenderedDropdownHtml;

        loadFixtures('oneLevelMenuWithCurrent.html');
        this.singleLevelMenuWithActiveItem = $('#one-level-menu-with-current');

        expectedDropdownHtml = `
          <select class="responsive-select-menu">
            <option value="#one">One</option>
            <option value="#two" selected="selected">Two</option>
            <option value="#three">Three</option>
            <option value="#four">Four</option>
          </select>
        `.replace(/\s+/g, ' ').trim();

        actualRenderedDropdownHtml = this.singleLevelMenuWithActiveItem
          .responsiveNavigationAdapter(this.adapterConfiguration)
          .data("responsiveNavigationAdapter")
          .select.parent()
          .html();

        return expect(actualRenderedDropdownHtml).toPossessSanitizedHtmlEquivalence(expectedDropdownHtml);
      });
    });

    describe("with a complex multi-level navigation hierarchy", function() {
      beforeEach(function() {
        loadFixtures("multiLevelMenu.html");
        this.complexMenuStructure = $("#multi-level-menu");

        loadFixtures("multiLevelMenuWithCurrent.html");
        this.complexMenuWithActiveEntry = $("#multi-level-with-current-menu");

        this.pluginDataKey = "responsiveNavigationAdapter";
      });

      it("should correctly generate the nested HTML dropdown tree", function() {
        let expectedDropdownHtml;
        let actualRenderedDropdownHtml;

        expectedDropdownHtml = `
          <select class="responsive-select-menu">
            <option value="#one">One</option>
            <option value="#two">Two</option>
            <option value="#sub-one">-- Sub-one</option>
            <option value="#sub-sub-one">---- Sub-Sub-one</option>
            <option value="#sub-sub-two">---- Sub-Sub-two</option>
            <option value="#sub-two">-- Sub-two</option>
            <option value="#three">Three</option>
            <option value="#four">Four</option>
          </select>
        `.replace(/\s+/g, ' ').trim();

        actualRenderedDropdownHtml = this.complexMenuStructure
          .responsiveNavigationAdapter(this.adapterConfiguration)
          .data(this.pluginDataKey)
          .select.parent()
          .html();

        return expect(actualRenderedDropdownHtml).toPossessSanitizedHtmlEquivalence(expectedDropdownHtml);
      });

      it("should correctly select the active item in a multi-level dropdown", function() {
        let expectedDropdownHtml;
        let actualRenderedDropdownHtml;

        expectedDropdownHtml = `
          <select class="responsive-select-menu">
            <option value="#one">One</option>
            <option value="#two">Two</option>
            <option value="#sub-one">-- Sub-one</option>
            <option value="#sub-sub-one">---- Sub-Sub-one</option>
            <option value="#sub-sub-two" selected="selected">---- Sub-Sub-two</option>
            <option value="#sub-two">-- Sub-two</option>
            <option value="#three">Three</option>
            <option value="#four">Four</option>
          </select>
        `.replace(/\s+/g, ' ').trim();

        actualRenderedDropdownHtml = this.complexMenuWithActiveEntry
          .responsiveNavigationAdapter(this.adapterConfiguration)
          .data(this.pluginDataKey)
          .select.parent()
          .html();

        return expect(actualRenderedDropdownHtml).toPossessSanitizedHtmlEquivalence(expectedDropdownHtml);
      });
    });

    describe("with the 'label' configuration option enabled", function() {
      it("should prepend a label option to the generated select dropdown", function() {
        let actualRenderedHtml;
        let expectedDropdownHtml;
        const labelSettings = {
          switchWidth: TEST_SWITCH_BREAKPOINT,
          appendTo: SELECTOR_DUMMY_ELEMENT,
          label: "Site Menu"
        };

        expectedDropdownHtml = `
          <select class="responsive-select-menu">
            <option value="#no-redirect">Site Menu</option>
            <option value="#one">One</option>
            <option value="#two">Two</option>
            <option value="#three">Three</option>
            <option value="#four">Four</option>
          </select>
        `.replace(/\s+/g, ' ').trim();

        actualRenderedHtml = this.primarySingleLevelMenu.responsiveNavigationAdapter(labelSettings).data("responsiveNavigationAdapter").select.parent().html();

        return expect(actualRenderedHtml).toPossessSanitizedHtmlEquivalence(expectedDropdownHtml);
      });
    });
  });

}).call(this);