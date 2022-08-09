(function () {
  "use strict";

  var app = angular.module('viewCustom', ['angularLoad']);

  app.component('prmTopBarBefore', {
    // we found it was more robust to insert the askus button in the different page location via primo angular, see below,
    // so completely skip inserting elements "by attribute"
    template: '<uq-gtm gtm="GTM-W4KK37"></uq-gtm>' +
        '<uq-header hideLibraryMenuItem="true" searchLabel="library.uq.edu.au" searchURL="http://library.uq.edu.au" skipnavid="searchBar"></uq-header>' +
        '<uq-site-header hideMyLibrary hideAskUs></uq-site-header>'
  });

  app.component('prmTopbarAfter', {
    template: '<alert-list system="primo"></alert-list>'
  });

  const accountLinkOptions = {
    title: 'Library account',
    id: 'mylibrary-menu-borrowing',
    subtext: 'Loans, requests & settings',
  }
  const favouriteLinkOptions = {
    title: 'Favourites',
    id: 'mylibrary-menu-saved-items',
    svgPath: 'm12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    subtext: 'Saved items, searches & search history',
  };
  const feedbackOptions = {
    title: 'Feedback',
    ariaLabel: 'Provide feedback',
    link: 'https://support.my.uq.edu.au/app/library/feedback',
    id: 'mylibrary-menu-feedback',
    svgPath: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z',
    subtext: '',
    newWindow: true,
    className: 'my-feedback-ctm',
  };
  let loggedOutfeedbackButton =
      `<md-menu-item id="loggedout-feedback" class="${feedbackOptions.className}" style="display: none">\n` +
      `    <button class="button-with-icon md-button md-primoExplore-theme md-ink-ripple" type="button" data-testid="${feedbackOptions.id}" onclick="javascript:window.open('${feedbackOptions.link}', '_blank');" ui-sref-opts="{reload: true, inherit:false}" role="menuitem" aria-label="${feedbackOptions.ariaLabel}"">\n` +
      '        <span class="svgwrapper">\n' +
      '            <svg width="100%" height="100%" viewBox="0 0 24 24" y="1032" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\n' +
      `                <path d="${feedbackOptions.svgPath}"></path>\n` +
      '            </svg>\n' +
      '        </span>\n' +
      `        <span class="account-link-title">${feedbackOptions.title}</span>\n` +
      '        <div class="md-ripple-container"></div>\n' +
      '    </button>\n' +
      '</md-menu-item>\n';
  let loggedinFeedbackButton =
      `<button class="desktop-feedback button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="${feedbackOptions.id}" aria-label="${feedbackOptions.ariaLabel}" role="menuitem" onclick="javascript:window.open('${feedbackOptions.link}', '_blank');">\n` +
      '    <svg viewBox="0 0 24 24" focusable="false">\n' +
      `        <path d="${feedbackOptions.svgPath}"></path>\n` +
      '    </svg>\n' +
      '    <div class="textwrapper">\n' +
      `        <span class="primaryText">${feedbackOptions.title}</span>\n` +
      `        <span class="subtext">${feedbackOptions.subtext}</span>\n` +
      '    </div>\n' +
      '</button>\n';

  const loggedInMenu = (id, feedbackClass) => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    const vid = params.vid || '61UQ';
    const domain = window.location.hostname;
    // THESE LINKS MUST REPEAT THE REUSABLE-WEBCOMPONENT AUTHBUTTON LINKS!
    // (NOTE: due to complexity of an account check in primo, we are not including the espace dashboard link here atm)
    let feedbackButton = loggedinFeedbackButton.replace('feedback-loggedin', feedbackClass);
    return `<ul id="${id}" class="mylibrary-list" style="display:none"` + '>\n' +
        // Account link from variable accountLinkOptions, above, at #1
        // Favourites from  variable favouriteLinkOptions, above, at #2
        '    <li>\n' +
        '        <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="mylibrary-menu-course-resources" aria-label="Go to Learning resources" role="menuitem" onclick="javascript:window.open(\'https://www.library.uq.edu.au/learning-resources\', \'_blank\');">\n' +
        '            <svg viewBox="0 0 24 24" focusable="false">\n' +
        '                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"></path>\n' +
        '            </svg>\n' +
        '            <div class="textwrapper">\n' +
        '                <span class="primaryText">Learning resources</span>\n' +
        '                <span class="subtext">Course readings &amp; exam papers</span>\n' +
        '            </div>\n' +
        '        </button>\n' +
        '    </li>\n' +
        '    <li>\n' +
        '        <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="mylibrary-menu-print-balance" aria-label="Go to Print balance" role="menuitem" onclick="javascript:window.open(\'https://lib-print.library.uq.edu.au:9192/user\', \'_blank\');">\n' +
        '            <svg viewBox="0 0 24 24" focusable="false">\n' +
        '                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"></path>\n' +
        '            </svg>\n' +
        '            <div class="textwrapper">\n' +
        '                <span class="primaryText">Print balance</span>\n' +
        '                <span class="subtext">Log in to your print account</span>\n' +
        '            </div>\n' +
        '        </button>\n' +
        '    </li>\n' +
        '    <li>\n' +
        '        <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="mylibrary-menu-room-bookings" aria-label="Go to Book a room or desk" role="menuitem" onclick="javascript:window.open(\'https://uqbookit.uq.edu.au/#/app/booking-types/77b52dde-d704-4b6d-917e-e820f7df07cb\', \'_blank\');">\n' +
        '            <svg viewBox="0 0 24 24" focusable="false">\n' +
        '                <path d="M2 17h20v2H2zm11.84-9.21c.1-.24.16-.51.16-.79 0-1.1-.9-2-2-2s-2 .9-2 2c0 .28.06.55.16.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21z"></path>\n' +
        '            </svg>\n' +
        '            <div class="textwrapper">\n' +
        '                <span class="primaryText">Book a room or desk</span>\n' +
        '                <span class="subtext">Student meeting &amp; study spaces</span>\n' +
        '            </div>\n' +
        '        </button>\n' +
        '    </li>\n' +
        '    <li>\n' +
        feedbackButton +
        '    </li>\n' +
        '</ul>';
  }

  function rewriteProvidedPrimoButton(e, primoIdentifier) {
    const button = document.querySelector(primoIdentifier + ' button');

    const awaitSVG = setInterval(() => {
      const cloneableSvg = document.querySelector(primoIdentifier + ' svg');
      if (!!cloneableSvg) {
        clearInterval(awaitSVG);

        // we dont always like their icons, and sadly there is no big list of icons documented that we can just reference
        !!e.svgPath && cloneableSvg.firstElementChild.setAttribute('d', e.svgPath);

        const svg = cloneableSvg.cloneNode(true);

        // move svg from inside md-icon to direct child of button
        !!button && !!svg && button.appendChild(svg);

        // clean primo-provided insides of button
        const removablePrm = document.querySelector(primoIdentifier + ' prm-icon');
        !!removablePrm && removablePrm.remove();
        const removableSpan = document.querySelector(primoIdentifier + ' span');
        !!removableSpan && removableSpan.remove();
        const removableDiv = document.querySelector(primoIdentifier + ' div');
        !!removableDiv && removableDiv.remove();

        // add our insides to the account button!
        const primaryText = document.createTextNode(e.title);
        const primaryTextBlock = document.createElement('span');
        !!primaryTextBlock && (primaryTextBlock.className = 'primaryText');
        !!primaryTextBlock && !!primaryText && primaryTextBlock.appendChild(primaryText);

        const textParent = document.createElement('div');
        !!textParent && (textParent.className = 'textwrapper');
        !!textParent && !!primaryTextBlock && textParent.appendChild(primaryTextBlock);

        const subtext = document.createTextNode(e.subtext);
        const subtextDiv = document.createElement('span');
        !!subtextDiv && !!subtext && (subtextDiv.className = 'subtext');
        !!subtextDiv && subtextDiv.appendChild(subtext);

        !!textParent && !!subtextDiv && textParent.appendChild(subtextDiv);
        !!button && !!textParent && button.appendChild(textParent);
      }
    }, 250);
  }

// prm-user-area-expandable-after
  app.component('prmUserAreaExpandableAfter', {
    // HANDLE LOGGED IN MENU
    controller: function($scope){
      setInterval(() => {
        const isLoggedOut = document.querySelector('.sign-in-btn-ctm');
        if (!isLoggedOut) {
          const desktopSibling = document.querySelector('h2[translate="nui.menu"]');
          const desiredParentDesktop = !!desktopSibling && desktopSibling.parentNode;
          const existingDesktopMenu = document.getElementById('mylibrary-list');
          const isDesktopMenuOpen = !existingDesktopMenu && !!desiredParentDesktop;

          const mobilemenuId = 'mylibrary-list-mobile';
          const mobilesibling = document.querySelector('md-dialog-content prm-authentication'); // entry that only occurs in mobile menu
          const existingmobileAccountLinksList = document.getElementById(mobilemenuId);
          const isMobileMenuOpen = !!mobilesibling && !existingmobileAccountLinksList;
          if (isMobileMenuOpen) {
            // mobile menu is open - add the Account Links to the mobile menu and remove the links we dont want
            const desiredParentMobile = mobilesibling.parentNode;
            // mobile menu is only in the DOM when the menu-open-button has been clicked, so create a new menu each time
            const clonableUsermenu = document.getElementById('mylibrary-list-clonable');
            const mobileusermenu = clonableUsermenu.cloneNode(true)
            !!mobileusermenu && (mobileusermenu.id = mobilemenuId);
            if (!!mobileusermenu && !!desiredParentMobile) {
              const currentParent = mobileusermenu.parentNode;
              if (desiredParentMobile !== currentParent) {
                mobileusermenu.style.display = 'block';
                desiredParentMobile.appendChild(mobileusermenu);

                // delete primo-defined account items
                const deletableItems = [
                  'prm-library-card-menu',
                ];
                deletableItems.forEach(e => {
                  const elem = document.querySelector(e);
                  !!elem && elem.remove();
                });

                rewriteProvidedPrimoButton(accountLinkOptions, 'prm-library-card-menu');

                rewriteProvidedPrimoButton(favouriteLinkOptions, '.settings-container .my-search-history-ctm');

                // delete any other items
                removeElementWhenItAppears('.settings-container > div > div', false);
              }
            }
          } else if (isDesktopMenuOpen) {
            const clonableUsermenu = document.getElementById('mylibrary-list-clonable');
            const createdDesktopMenu = clonableUsermenu.cloneNode(true);
            !!createdDesktopMenu && (createdDesktopMenu.id = 'mylibrary-list');
            const currentParent = createdDesktopMenu.parentNode;
            if (desiredParentDesktop !== currentParent) {
              // append new Account links to existing menu
              desiredParentDesktop.appendChild(createdDesktopMenu);
              createdDesktopMenu.style.display = 'block';

              // delete the items they provide because we have similar in our account links list
              const deletionClassList = [
                '.my-loans-ctm',
                '.my-requests-ctm',
                '.my-favorties-ctm',
                '.my-PersonalDetails-ctm',
              ];
              deletionClassList.forEach(e => {
                const elem = document.querySelector(e);
                !!elem && elem.remove();
              });

              rewriteProvidedPrimoButton(accountLinkOptions, '.my-library-card-ctm');

              rewriteProvidedPrimoButton(favouriteLinkOptions, '.my-search-history-ctm');

              // remove the dividers, having removed all the contents of the block (TODO change to querySelectorAll)
              const hr1 = document.querySelector('md-menu-divider')
              !!hr1 && hr1.remove();
              const hr2 = document.querySelector('md-menu-divider')
              !!hr2 && hr2.remove();
            }
          }
        }
      }, 250);
    },
    template: loggedInMenu('mylibrary-list-clonable', 'loggedin-feedback-button')
  });

  // there is a delayed load for a lot of items, but no guarantee that they will be provided on any given page, so only try so many times
  function removeElementWhenItAppears(selector, onlyOne = true, timeout = 100, maxLoops = 20) {
    let loopCount = 0;
    const awaitButton = setInterval(() => {
      if (loopCount > maxLoops) {
        clearInterval(awaitButton);
      }

      const element = !!onlyOne ? document.querySelector(selector) : document.querySelectorAll(selector);
      if (!!element) {
        clearInterval(awaitButton);

        if (!!onlyOne) {
          element.remove();
        } else {
          element.forEach(e => e.remove());
        }
      }
      loopCount++;
    }, timeout);
  }

  // prm-explore-footer-after
  app.component('prmExploreFooterAfter', {
    // HANDLE LOGGED OUT VIEW
    controller: function($scope){
      const awaitLoggedout = setInterval(() => {
        const isLoggedOut = document.querySelector('.sign-in-btn-ctm');
        if (!!isLoggedOut) {
          const isDesktopMenuOpen = document.querySelector('prm-user-area-expandable md-menu');
          const isMobileMenuOpen = document.querySelector('.mobile-menu-button');
          if (!!isMobileMenuOpen)  {
            clearInterval(awaitLoggedout);
            const awaitLoggedoutMobileMenu = setInterval(() => {
              // dont clear this interval - we have to re add each time the menu opens :(
              const mobilesibling = document.querySelector('prm-main-menu prm-library-card-menu'); // entry that only occurs in mobile logged out menu
              const desiredParentMobile = !!mobilesibling && mobilesibling.parentNode;
              const feedbackButtonClonable = document.getElementById('loggedout-feedback');
              let newfeedbackbuttonId = 'loggedout-mobile-feedback';
              const newfeedbackbuttonFound = document.getElementById(newfeedbackbuttonId);
              if (!newfeedbackbuttonFound && !!desiredParentMobile && !!feedbackButtonClonable) {

                // append feedback item to end of menu area
                const newfeedbackbutton = feedbackButtonClonable.cloneNode(true)
                newfeedbackbutton.id = newfeedbackbuttonId;
                !!newfeedbackbutton && (newfeedbackbutton.style.display = 'block');
                !!newfeedbackbutton && desiredParentMobile.appendChild(newfeedbackbutton);

                removeElementWhenItAppears('.settings-container prm-authentication') // "Log in" menu item that duplicates "My account" function
              }
            }, 250);

          } else if (!!isDesktopMenuOpen) { // is desktop menu
            clearInterval(awaitLoggedout);

            const waitForDesktopFeedbackLink = setInterval(() => {
              const feedbackButtonClonable = document.getElementById('loggedout-feedback');
              if (!!feedbackButtonClonable) {
                clearInterval(waitForDesktopFeedbackLink);

                // insert new account links at end of menu area
                const plannedParent = document.querySelector('md-menu-content');

                const newfeedbackbutton = feedbackButtonClonable.cloneNode(true);
                newfeedbackbutton.id = 'loggedout-desktop-feedback';
                !!newfeedbackbutton && (newfeedbackbutton.style.display = 'block');
                !!plannedParent && !!newfeedbackbutton && plannedParent.appendChild(newfeedbackbutton);
              }
            }, 100);
          }
        }
      }, 250);
    },
    template: `<div id="loggedoutFeedbackButtonBlock">${loggedOutfeedbackButton}</div>`
  });

  app.component('prmSearchBookmarkFilterAfter', {
    controller: function($scope){
      // move the primo-login-bar up so it overlaps uq-site-header and is visually one bar
      var primoLoginBar = document.querySelector('prm-topbar>div.top-nav-bar.layout-row') || false;
      !!primoLoginBar && (primoLoginBar.style.marginTop = '-61px');
    },
    template: '<askus-button nopaneopacity></askus-button>'
  });

  // based on https://knowledge.exlibrisgroup.com/Primo/Community_Knowledge/How_to_create_a_%E2%80%98Report_a_Problem%E2%80%99_button_below_the_ViewIt_iframe
  app.component('prmFullViewServiceContainerAfter', {
    bindings: {parentCtrl: '<'},
    controller: function($scope){
      var vm = this;

      vm.targeturl = '';

      var recordId = '';
      // no one knows what the TN actually means (per SVG), but in practice all the CDI records have it on their record id
      if (!!vm.parentCtrl?.item?.pnx?.control?.recordid &&
          vm.parentCtrl.item.pnx.control.recordid[0] && vm.parentCtrl.item.pnx.control.recordid[0].startsWith('TN')) {
        recordId = encodeURIComponent(vm.parentCtrl.item.pnx.control.recordid);
      }
      if (recordId === '') {
        if (!!vm.parentCtrl?.item?.pnx?.search?.recordid) {
          recordId = encodeURIComponent(vm.parentCtrl.item.pnx.search.recordid);
        }
      }
      if (recordId === '') {
        // from http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
        var fieldname = 'docid';
        var temp = encodeURIComponent((new RegExp('[?|&]' + fieldname + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
        if (temp !== null) {
          recordId = temp;
        }
      }

      var recordTitle = '';
      if (recordId !== '' && !!vm?.parentCtrl?.item?.pnx?.search?.title && !!vm.parentCtrl.item.pnx.search.title[0]) {
        recordTitle = encodeURIComponent(vm.parentCtrl.item.pnx.search.title[0]);
      }
      if (recordTitle === '' && !!vm.parentCtrl?.item?.pnx?.display?.title && !!vm.parentCtrl.item.pnx.display.title[0]) {
        recordTitle = encodeURIComponent(vm.parentCtrl.item.pnx.display.title[0]);
      }
      if (recordTitle !== '') {
        var maxNumberCharCRMCanAccept = 239;
        recordTitle = recordTitle.trim().substring(0, maxNumberCharCRMCanAccept);
      }

      var isIE11 = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1;

      // if we are not IE11 and can get a docid and a title - add a button
      if (!isIE11 && recordId !== '' && recordTitle !== '') {
        var crmDomain = 'https://uqcurrent--tst1.custhelp.com'; // we can probably return the live url for all when this is in prod
        if (window.location.hostname === 'search.library.uq.edu.au') {
          crmDomain = 'https://support.my.uq.edu.au';
        }

        vm.targeturl = crmDomain + "/app/library/contact/report_problem/true/incidents.subject/" + recordTitle + "/incidents.c$summary/" + recordId;
      }
    },
    template : '<div ng-if="$ctrl.targeturl"><getit-link-service>' +
        '<button class="help-button md-button md-primoExplore-theme md-ink-ripple" type="button" data-ng-click="buttonPressed($event)" aria-label="Report a Problem" aria-hidden="false">' +
        '<a ng-href="{{$ctrl.targeturl}}" target="_blank">Report a Problem</a>' +
        '</button>' +
        '</getit-link-service></div>'
  });

  /****************************************************************************************************/

  /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

  /*var app = angular.module('centralCustom', ['angularLoad']);*/

  /****************************************************************************************************/

  // if the record is one of certain types, the 'Available Online' link should open View It, instead of jumping straight to the resource
  // (this is because there are usually multiple resources, and the default one may not be the best)
  app.controller('prmOpenSpecificTypesInFullController', [
    function () {
      var vm = this;
      vm.$onInit = function () {
        var resourceType = (!!vm.parentCtrl.result && !!vm.parentCtrl.result.pnx && !!vm.parentCtrl.result.pnx.display &&
            !!vm.parentCtrl.result.pnx.display.type && vm.parentCtrl.result.pnx.display.type.length > 0 &&
            vm.parentCtrl.result.pnx.display.type[0]) || '';
        if (resourceType === 'journal' || resourceType === 'newspaper') {
          vm.parentCtrl.isDirectLink = function () { return false; };
        }
      };
    }
  ]);
  app.component('prmOpenSpecificTypesInFull', {
    bindings: { parentCtrl: '<' },
    controller: 'prmOpenSpecificTypesInFullController'
  });
  app.component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<' },
    template: '<prm-open-specific-types-in-full parent-ctrl="$ctrl.parentCtrl"></prm-open-specific-types-in-full>'
  });

  function insertScript(url) {
    var script = document.querySelector("script[src*='" + url + "']");
    if (!script) {
      var heads = document.getElementsByTagName("head");
      if (heads && heads.length) {
        var head = heads[0];
        if (head) {
          script = document.createElement('script');
          script.setAttribute('src', url);
          script.setAttribute('type', 'text/javascript');
          script.setAttribute('defer', '');
          head.appendChild(script);
        }
      }
    }
  }

  function insertStylesheet(href) {
    var linkTag = document.querySelector("link[href*='" + href + "']");
    if (!linkTag) {
      var heads = document.getElementsByTagName("head");
      if (heads && heads.length) {
        var head = heads[0];
        if (head) {
          linkTag = document.createElement('link');
          linkTag.setAttribute('href', href);
          linkTag.setAttribute('rel', 'stylesheet');
          head.appendChild(linkTag);
        }
      }
    }
  }

  // this script should only be called on views that have UQ header showing
  var folder = '/'; // default. Use for prod.
  if (window.location.hostname === 'search.library.uq.edu.au') {
    if (/vid=61UQ_DEV/.test(window.location.href)) {
      folder = '-development/primo-prod-dev/';
    }
  } else {
    if (/vid=61UQ_DEV/.test(window.location.href)) {
      folder = '-development/primo-sandbox-dev/';
    } else if (/vid=61UQ/.test(window.location.href)) {
      folder = '-development/primo-sandbox/';
    }
  }

  // this script should only be called on views that have UQ header showing
  insertScript('https://assets.library.uq.edu.au/reusable-webcomponents' + folder + 'uq-lib-reusable.min.js');
  // we dont yet need this script, but if we do it should be in this location
  // insertScript('https://assets.library.uq.edu.au/reusable-webcomponents' + folder + 'applications/primo/load.js');
  insertStylesheet('https://assets.library.uq.edu.au/reusable-webcomponents' + folder + 'applications/primo/custom-styles.css');
  insertStylesheet('https://static.uq.net.au/v6/fonts/Roboto/roboto.css');
  insertStylesheet('https://static.uq.net.au/v9/fonts/Merriweather/merriweather.css');
  insertStylesheet('https://static.uq.net.au/v13/fonts/Montserrat/montserrat.css');
})();
