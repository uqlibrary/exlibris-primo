function whenPageLoaded(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

(function () {
  "use strict";

  var app = angular.module('viewCustom', ['angularLoad'])
      //per https://support.talis.com/hc/en-us/articles/115002712709-Primo-Explore-Integrations-with-Talis-Aspire and https://github.com/alfi1/primo-aspire-api/blob/master/getAspireLists_Angular1-6.js
      // Whitelisting
      .constant('AspireTrustBaseUrl', "https://uq.rl.talis.com/").config(['$sceDelegateProvider', 'AspireTrustBaseUrl', function ($sceDelegateProvider, AspireTrustBaseUrl) {
        var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
        urlWhitelist.push(AspireTrustBaseUrl + '**');
        $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
      }]);

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
    svgPath: 'M2,3H22C23.05,3 24,3.95 24,5V19C24,20.05 23.05,21 22,21H2C0.95,21 0,20.05 0,19V5C0,3.95 0.95,3 2,3M14,6V7H22V6H14M14,8V9H21.5L22,9V8H14M14,10V11H21V10H14M8,13.91C6,13.91 2,15 2,17V18H14V17C14,15 10,13.91 8,13.91M8,6A3,3 0 0,0 5,9A3,3 0 0,0 8,12A3,3 0 0,0 11,9A3,3 0 0,0 8,6Z',
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
    // THESE LINKS MUST REPEAT THE REUSABLE-WEBCOMPONENT AUTHBUTTON LINKS!
    // (NOTE: due to complexity of an account check in primo, we are not including the espace dashboard link here atm)
    let feedbackButton = loggedinFeedbackButton.replace('feedback-loggedin', feedbackClass);
    return `<ul id="${id}" class="mylibrary-list" style="display:none"` + '>\n' +
        // Account link from variable accountLinkOptions, above, at #1
        '    <li>\n' +
        `        <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="${favouriteLinkOptions.id}" aria-label="Go to ${favouriteLinkOptions.title}" role="menuitem" onclick="location.href='/primo-explore/favorites?vid=61UQ_DEV&amp;lang=en_US&amp;section=items'">\n` +
        '            <svg viewBox="0 0 24 24" focusable="false">\n' +
        `                 <path d="${favouriteLinkOptions.svgPath}"></path>\n` +
        '            </svg>\n' +
        '            <div class="textwrapper">\n' +
        `                 <span class="primaryText">${favouriteLinkOptions.title}</span>\n` +
        `                 <span class="subtext">${favouriteLinkOptions.subtext}</span>\n` +
        '            </div>\n' +
        '        </button>\n' +
        '    </li>\n' +
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

  // we dont always like their icons, and sadly there is no big list of primo icons documented that we can just reference
  // so we just remove their icon and insert one we like, having gotten the path for the svg from the mui icon list
  function rewriteProvidedPrimoButton(e, primoIdentifier) {
    const button = document.querySelector(primoIdentifier + ' button');
    if (!button) {
      return;
    }

    const awaitSVG = setInterval(() => {
      const cloneableSvg = document.querySelector(primoIdentifier + ' svg');
      if (!!cloneableSvg) {
        clearInterval(awaitSVG);

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

  function createLabelledButton(options) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    !!path && path.setAttribute('d', options.svgPath);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    !!svg && svg.setAttribute('class', 'svgIcon');
    !!svg && svg.setAttribute('focusable', 'false');
    !!svg && svg.setAttribute('viewBox', '0 0 24 24');
    !!svg && svg.setAttribute('ariaHidden', 'true');
    !!svg && !!path && svg.appendChild(path);

    const button = document.createElement('button');
    !!button && (button.id = options.id);
    !!button && !!svg && button.appendChild(svg);

    // add our insides to the  button!
    const primaryText = document.createTextNode(options.title);
    const primaryTextBlock = document.createElement('span');
    !!primaryTextBlock && (primaryTextBlock.className = 'primaryText');
    !!primaryTextBlock && !!primaryText && primaryTextBlock.appendChild(primaryText);

    const textParent = document.createElement('div');
    !!textParent && (textParent.className = 'textwrapper');
    !!textParent && !!primaryTextBlock && textParent.appendChild(primaryTextBlock);

    const subtext = document.createTextNode(options.subtext);
    const subtextDiv = document.createElement('span');
    !!subtextDiv && !!subtext && (subtextDiv.className = 'subtext');
    !!subtextDiv && subtextDiv.appendChild(subtext);

    !!textParent && !!subtextDiv && textParent.appendChild(subtextDiv);
    !!button && !!textParent && button.appendChild(textParent);

    return button;
  }

  // prm-user-area-expandable-after
  app.component('prmUserAreaExpandableAfter', {
    // HANDLE LOGGED IN MENU
    controller: function($scope){
      setInterval(() => {
        const isLoggedOut = document.querySelector('.sign-in-btn-ctm');
        if (!!isLoggedOut) {
          return;
        }

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

              // delete the search history over and over and over....
              removeElementWhenItAppears('.my-search-history-ctm');

              // delete any other items
              removeElementWhenItAppears('.settings-container > div > div', false);
            }

            // if the mobile menu is closed then opened again, the built in account link goes away. Weird.
            // Let's replace it manually.
            const waitForBuiltInAccountButtonToFirstExist = setInterval(() => {
              // we dont start waiting for the built in account button to be missing until it has actually appeared
              const builtInAccountButtonFirst = document.querySelector('.mobile-main-menu-bg [aria-label="Go to library account"]');
              if (!builtInAccountButtonFirst) {
                return
              }

              // now the built in account button exists. Wait for it to _not_ exist.
              // this implies the user has closed the mobile menu and then reopened (I mean... honestly!!! :( )
              const ensureAccountButtonExists = setInterval(() => {
                const replacementAccountButton = document.getElementById(accountLinkOptions.id);
                const builtInAccountButton = document.querySelector('.mobile-main-menu-bg [aria-label="Go to library account"]');
                if (!builtInAccountButton && !replacementAccountButton) {
                  const plannedParent = document.querySelector('.mobile-main-menu-bg prm-authentication');

                  const accountButton = createLabelledButton(accountLinkOptions);
                  // wrap the button in a list, so we can apply the same styles to it as the other buttons
                  const wrappingListItem = document.createElement('li')
                  !!wrappingListItem && !!accountButton && wrappingListItem.appendChild(accountButton)
                  const wrappingList = document.createElement('ul');
                  !!wrappingList && (wrappingList.className = 'mylibrary-list');
                  !!wrappingList && !!wrappingListItem && wrappingList.appendChild(wrappingListItem)
                  !!wrappingList && !!plannedParent &&
                    plannedParent.insertBefore(wrappingList, plannedParent.firstChild) &&
                    clearInterval(waitForBuiltInAccountButtonToFirstExist)
                  ;

                }
              }, 100); // never stop waiting, that second open may be a long time before it happens
            }, 100);
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
              '.my-search-history-ctm',
              '.my-PersonalDetails-ctm',
              '.my-favorties-ctm', // what they currently have as the class for My Favourites
              '.my-favorites-ctm', // in case they fix the spelling quietly
            ];
            deletionClassList.forEach(e => {
              const elem = document.querySelector(e);
              !!elem && elem.remove();
            });

            rewriteProvidedPrimoButton(accountLinkOptions, '.my-library-card-ctm');

            // remove the dividers, having removed all the contents of the block (TODO change to querySelectorAll)
            const hr1 = document.querySelector('md-menu-divider')
            !!hr1 && hr1.remove();
            const hr2 = document.querySelector('md-menu-divider')
            !!hr2 && hr2.remove();
          }
        }

      }, 250);
    },
    template: loggedInMenu('mylibrary-list-clonable', 'loggedin-feedback-button')
  });

  // there is a delayed load for a lot of items, but no guarantee that they will be provided on any given page, so only try so many times
  function removeElementWhenItAppears(selector, onlyOne = true, timeout = 100, maxLoops = 100) {
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
        if (!isLoggedOut) {
          return;
        }

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

              removeElementWhenItAppears('.settings-container prm-authentication'); // "Log in" menu item that duplicates "My account" function
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
      this.$onInit = function () {
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
          const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
          });
          const paramRecordId = !!params?.docid ? params.docid : null;
          if (paramRecordId !== null) {
            recordId = paramRecordId;
          }
        }

        let recordTitle = '';
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

        // we may have trimmed in the middle of an encoded char, eg sit%20down trimmed to sit%2
        // which ends up with an 400 Bad Result as the url becomes rubbish
        const maxLengthEncodedChar = '%E2%82%AC';
        [...Array(maxLengthEncodedChar.length)].map((_, i) => {
          try {
            decodeURIComponent(recordTitle)
          } catch {
            recordTitle = recordTitle.slice(0, -1);
          }
        });

        var isIE11 = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1;

        // if we are not IE11 and can get a docid and a title - add a button
        if (!isIE11 && recordId !== '' && recordTitle !== '') {
          var crmDomain = 'https://uqcurrent--tst1.custhelp.com'; // we can probably return the live url for all when this is in prod
          if (window.location.hostname === 'search.library.uq.edu.au') {
            crmDomain = 'https://support.my.uq.edu.au';
          }

          vm.targeturl = crmDomain + "/app/library/contact/report_problem/true/incidents.subject/" + recordTitle + "/incidents.c$summary/" + recordId;
        }
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

  function createIndicator(svgPathValue, iconWrapperClassName, labelText, uniqueId) {

    const iconClassName = `${iconWrapperClassName}Icon`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    !!path && (path.setAttribute('d', svgPathValue));

    const svgCR = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    !!svgCR && svgCR.setAttribute('width', '100%');
    !!svgCR && svgCR.setAttribute('height', '100%');
    !!svgCR && svgCR.setAttribute('viewBox', '0 0 24 24');
    !!svgCR && svgCR.setAttribute('focusable', 'false');
    !!svgCR && svgCR.setAttribute('class', 'icon-after-icon');
    !!svgCR && !!path && svgCR.appendChild(path);

    const mdIcon = document.createElement('md-icon');
    !!mdIcon && mdIcon.setAttribute('role', 'presentation');
    !!mdIcon && (mdIcon.className = 'md-primoExplore-theme');
    !!mdIcon && !!svgCR && mdIcon.appendChild(svgCR);

    const prmIcon = document.createElement('span');
    !!prmIcon && (prmIcon.className = `${iconClassName} indicatorIcon`);
    !!prmIcon && !!mdIcon && prmIcon.appendChild(mdIcon);

    const contentLabel = document.createElement('span');
    !!contentLabel && (contentLabel.className = 'customIndicatorLabel');
    !!contentLabel && (contentLabel.innerHTML = labelText);

    const iconWrapper = document.createElement('span');
    !!iconWrapper && (iconWrapper.id = uniqueId);
    // !!iconWrapper && (iconWrapper.className = iconWrapperClassName);
    !!iconWrapper && (iconWrapper.className = 'customIndicator');
    !!iconWrapper && !!prmIcon && iconWrapper.appendChild(prmIcon);
    !!iconWrapper && !!contentLabel && iconWrapper.appendChild(contentLabel);

    return iconWrapper;
  }

  function getSnippet(parentDOMId) {
    return document.querySelector(`#${parentDOMId} prm-snippet`);
  }

  function addIndicatorToHeader(uniqueId, pageType, parentDOMId, createdIndicator) {
    const existingIndicator = document.getElementById(uniqueId);
    if (!!existingIndicator) {
      console.log('addIndicatorToHeader: for ', pageType, ' bail because found ID: ', uniqueId);
      return;
    }

    let indicatorParent = false;
    // if available, add it to the line of "Peer reviewed" "Open Access" etc icons
    const openAccessIndicator = document.querySelector(`#${parentDOMId} .open-access-mark`);
    if (!!openAccessIndicator) {
      indicatorParent = openAccessIndicator.parentNode;
    }
    if (!indicatorParent) {
      const peerReviewedIndicator = document.querySelector(`#${parentDOMId} .peer-reviewed-mark`);
      if (!!peerReviewedIndicator) {
        indicatorParent = peerReviewedIndicator.parentNode;
      }
    }
    if (!!indicatorParent) {
      indicatorParent.appendChild(createdIndicator);
    } else {
      // no such icons? add it as a new line after the snippet
      // we have to make a wrapping div in case there is more than one Indicator, even though its rare
      // and of course we don't know if another Indicator creation has already happened....
      let indicatorWrapper = document.querySelector(`#${parentDOMId} div.indicatorWrapper`);
      if (!indicatorWrapper) {
        indicatorWrapper = document.createElement('div');
        !!indicatorWrapper && (indicatorWrapper.className = 'indicatorWrapper');
        const snippet = getSnippet(parentDOMId);
        !!snippet && !!indicatorWrapper && snippet.parentNode.insertBefore(indicatorWrapper, snippet.nextSibling);
      }
      !!indicatorWrapper && indicatorWrapper.appendChild(createdIndicator);
    }
  }

  function getParentDomId(recordId) {
    const selectorRoot = 'SEARCH_RESULT_RECORDID_';
    let parentDOMId = `${selectorRoot}${recordId}_FULL_VIEW`;
    const domCheck = document.querySelector(`#${parentDOMId}`);
    if (!domCheck) {
      parentDOMId = `${selectorRoot}${recordId}`;
    }
    return parentDOMId;
  }

  function addCulturalAdviceIndicatorToHeader(recordId, pageType) {
    const className = 'culturalAdviceMark';
    const thisIndicatorAbbrev = 'cultadv';
    const muiIconInfoSvgPath = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
    const labelText = 'CULTURAL ADVICE';

    console.log(thisIndicatorAbbrev, '::addCulturalAdviceIndicatorToHeader start', recordId);
    console.log(thisIndicatorAbbrev, '::addCulturalAdviceIndicatorToHeader pageType', pageType);

    const parentDOMId = getParentDomId(recordId);
    const uniqueId = `${parentDOMId}-${thisIndicatorAbbrev}-${pageType}`;

    const createdIndicator = createIndicator(muiIconInfoSvgPath, className, labelText, uniqueId);
    if (!createdIndicator) {
      return;
    }

    const waitforSnippetToExist = setInterval(() => {
      const parentDOMId = getParentDomId(recordId);
      const snippet = getSnippet(parentDOMId);
      if (!!snippet) { // we are hoping that once the snippet exists that any OA or PR Indicators are present
        clearInterval(waitforSnippetToExist);
        addIndicatorToHeader(uniqueId, pageType, parentDOMId, createdIndicator);
      }
    }, 100);
    return true;
  }

  function addCourseResourceIndicatorToHeader(recordId, pageType) {
    const className = 'readingListMark';
    const thisIndicatorAbbrev = 'courseres';
    const muiIconAccountBalanceSvgPath = 'M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z';
    const labelText = 'COURSE READING LIST';

    const parentDOMId = getParentDomId(recordId);
    const uniqueId = `${parentDOMId}-${thisIndicatorAbbrev}-${pageType}`;

    const createdIndicator = createIndicator(muiIconAccountBalanceSvgPath, className, labelText, uniqueId);
    if (!createdIndicator) {
      return;
    }

    addIndicatorToHeader(uniqueId, pageType, parentDOMId, createdIndicator);
    return true;
  }

  function getListTalisUrls(item) {
    const TALIS_DOMAIN = 'https://uq.rl.talis.com/';
    const list = [];
    const materialtype = !!item?.pnx?.display?.type && item.pnx.display.type[0];

    // LCN
    if (materialtype !== 'book_chapter' && !!item?.pnx?.search?.addsrcrecordid && item.pnx.search.addsrcrecordid.length > 0) {
      item.pnx.search.addsrcrecordid.forEach(r => {
        list.push(TALIS_DOMAIN + 'lcn/' + r + '/lists.json');
      })
    }

    // DOI
    if (!!item?.pnx?.addata?.doi && item.pnx.addata.doi.length > 0) {
      item.pnx.addata.doi.forEach(r => {
        list.push(TALIS_DOMAIN + 'doi/' + r + '/lists.json');
      })
    }

    // EISBN
    if (materialtype !== 'book_chapter' && !!item?.pnx?.addata?.eisbn && item.pnx.addata.eisbn.length > 0) {
      item.pnx.addata.eisbn.forEach(r => {
        const isbn = r.replace(/[^0-9X]+/gi, '');
        [10, 13].includes(isbn.length) && list.push(TALIS_DOMAIN + 'eisbn/' + isbn + '/lists.json');
      })
    }

    // ISBN
    if (materialtype !== 'book_chapter' && !!item?.pnx?.addata?.isbn && item.pnx.addata.isbn.length > 0) {
      item.pnx.addata.isbn.forEach(r => {
        const isbn = r.replace(/[^0-9X]+/gi, '');
        [10, 13].includes(isbn.length) && list.push(TALIS_DOMAIN + 'isbn/' + isbn + '/lists.json');
      })
    }

    // EISSN
    if (materialtype === 'journal' && !!item?.pnx?.addata?.eissn && item.pnx.addata.eissn.length > 0) {
      item.pnx.addata.eissn.forEach(r => {
        list.push(TALIS_DOMAIN + 'eissn/' + r + '/lists.json');
      })
    }

    // ISSN
    if (materialtype === 'journal' && !!item?.pnx?.addata?.issn && item.pnx.addata.issn.length > 0) {
      item.pnx.addata.issn.forEach(r => {
        list.push(TALIS_DOMAIN + 'issn/' + r + '/lists.json');
      })
    }

    return list;
  }

  function isFullDisplayPage() {
    return window.location.pathname.includes('fulldisplay');
  }

  function addCulturalAdviceBanner(displayText) {
    // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain images transcripts or names of Aboriginal and Torres Strait Islander people now deceased.  It may also contain historically and culturally sensitive words, terms, and descriptions."
    const displayBlockClassName = 'culturalAdviceBanner';
    const displayBlock = document.querySelector(`.${displayBlockClassName}`);
    if (!!displayBlock) {
      // block already exists - don't duplicate
      console.log('CA::banner block already exists - dont duplicate');
      return;
    }

    const para = document.createElement('p');
    // move these styles to the reusable scss file when it looks right
    !!para && (para.style.padding = '1em');
    !!para && (para.style.borderColor = '#bbd8f5');
    !!para && (para.style.color = '#000');
    !!para && (para.style.backgroundColor = '#bbd8f5');
    !!para && (para.style.borderRadius = '3px');
    !!para && (para.innerHTML = displayText);

    const block = document.createElement('div');
    !!block && (block.className = displayBlockClassName);
    !!para && !!para && block.appendChild(para);

    const siblingClass = '.search-result-availability-line-wrapper';
    const siblings = document.querySelectorAll(siblingClass);
    siblings.forEach(appendToSibling => {
      console.log('append ', appendToSibling);
      appendToSibling.insertAdjacentElement('afterend', block)
    });
  }

  // based on https://support.talis.com/hc/en-us/articles/115002712709-Primo-Explore-Integrations-with-Talis-Aspire
  // and https://github.com/alfi1/primo-aspire-api/blob/master/getAspireLists_Angular1-6.js
  // check for a reading list in the full results page and add an indicator and list if so
  app.component('prmServiceDetailsAfter', {
    bindings: {parentCtrl: '<'},
    controller: function ($scope, $http) {
      var vm = this;

      this.$onInit = function () {
        $scope.talisCourses = [];
        $scope.hasCourses = false;

        if (!isFullDisplayPage()) {
          return;
        }

        let courseList = {}; // associative arrays are done in js as objects

        async function getTalisDataFromAllApiCalls(listUrls) {
          const listUrlsToCall = listUrls.filter(url => url.startsWith('http'))
          const promiseList = listUrlsToCall.map(url => $http.jsonp(url, {jsonpCallbackParam: 'cb'}));
          // get all the urls then sort them into a non-repeating list
          await Promise.allSettled(promiseList)
            .then(response => {
              response.forEach(r => {
                if (!r.status || r.status !== 'fulfilled' || !r.value || !r.value.data) {
                  return;
                }
                for (let talisUrl in r.value.data) {
                  const subjectCode = r.value.data[talisUrl];
                  !courseList[talisUrl] && (courseList[talisUrl] = subjectCode);
                }
              })
            })
            .finally(() => {
              if (Object.keys(courseList).length > 0) {
                $scope.hasCourses = true;

                const recordid = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
                if (!!recordid) {
                  addCourseResourceIndicatorToHeader(recordid, 'full');
                }

                $scope.talisCourses = {};
                // sort by course code for display
                let sortable = [];
                for (let talisUrl in courseList) {
                  const subjectCode = courseList[talisUrl];
                  sortable.push([talisUrl, subjectCode]);
                }
                sortable.sort(function(a, b) {
                  return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
                });
                sortable.forEach((entry) => {
                  const subjectCode = entry[1];
                  const talisUrl = entry[0]
                  $scope.talisCourses[talisUrl] = subjectCode
                })
              }
            });
        }

        const listTalisUrls = vm?.parentCtrl?.item && getListTalisUrls(vm.parentCtrl.item);
        if (!!listTalisUrls && listTalisUrls.length > 0) {
          getTalisDataFromAllApiCalls(listTalisUrls);
        }

        // display the cultural advice indicator on appropriate records
        const recordId = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
        console.log('CA::full recordId=', recordId);
        const culturalAdviceText = !!vm?.parentCtrl?.item?.pnx?.facets?.lfc04 && vm.parentCtrl.item.pnx.facets?.lfc04; // eg "Cultural advice - Aboriginal and Torres Strait Islander people"
        if (!!culturalAdviceText && !!recordId) {
          console.log('CA::full I would add a CA indicator on ', recordId);
          addCulturalAdviceIndicatorToHeader(recordId, 'full');

          const culturalAdviceBody = !!vm?.parentCtrl?.item?.pnx?.search?.lsr47 && vm.parentCtrl.item.pnx.search?.lsr47; // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain ..."
          console.log('CA::banner would show ', culturalAdviceBody);
          !!culturalAdviceBody && culturalAdviceBody.length > 0 && addCulturalAdviceBanner(culturalAdviceBody[0]);
        }
      }
    },
    template: '<div class="readingListCitations" ng-show="hasCourses">' +
        '<h4>Course reading lists</h4>' +
        '<ul>' +
        '<li ng-repeat="(url,listname) in talisCourses">' +
        '<a href="{{url}}" target="_blank">{{listname}} </a>' +
        '</li>' +
        '</ul>' +
        '</div>'
  });

  // check for a reading list on each result in the brief result list (search results) and add an indicator if so
  app.component('prmBriefResultContainerAfter', {
    bindings: { parentCtrl: '<' },
    controller: function ($scope, $http) {
      var vm = this;

      this.$onInit = function () {
        $scope.listsFound = null;

        if (!!isFullDisplayPage()) {
          return;
        }

        function getTalisDataFromFirstSuccessfulApiCall(listUrlsToCall) {
          const url = listTalisUrls.shift();
          url.startsWith('http') && $http.jsonp(url, {jsonpCallbackParam: 'cb'})
              .then(function handleSuccess(response) {
                $scope.listsFound = response.data || null;
                if (!$scope.listsFound && listUrlsToCall.length > 0) {
                  getTalisDataFromFirstSuccessfulApiCall(listUrlsToCall);
                }
                if (!!$scope.listsFound) {
                  const recordid = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // 61UQ_ALMA51124881340003131
                  if (!!recordid) {
                    addCourseResourceIndicatorToHeader(recordid, 'brief');
                    // whenPageLoaded(addCourseResourceIndicatorToHeader(recordid, 'brief'));
                  }
                }
              })
              .catch(() => {
                if (!$scope.listsFound && listUrlsToCall.length > 0) {
                  getTalisDataFromFirstSuccessfulApiCall(listUrlsToCall);
                }
              });
        }

        const listTalisUrls = vm?.parentCtrl?.item && getListTalisUrls(vm.parentCtrl.item);
        !!listTalisUrls && listTalisUrls.length > 0 && getTalisDataFromFirstSuccessfulApiCall(listTalisUrls);

        // display the cultural advice indicator on appropriate records
        const recordId = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
        console.log('CA::brief recordId=', recordId);
        console.log(vm?.parentCtrl?.item?.pnx);
        console.log(vm?.parentCtrl?.resultUtil._updatedBulkSize);
        const recordCount = !!vm?.parentCtrl?.resultUtil?._updatedBulkSize ? vm.parentCtrl.resultUtil._updatedBulkSize : 'x'; // eg 61UQ_ALMA51124881340003131
        console.log(vm?.parentCtrl);
        const culturalAdviceText = !!vm?.parentCtrl?.item?.pnx?.facets?.lfc04 && vm.parentCtrl.item.pnx.facets?.lfc04; // "eg Aboriginal and Torres Strait Islander people are warned that this resource may contain ..."
        console.log('CA::brief culturalAdviceText=', culturalAdviceText);
        if (!!culturalAdviceText && !!recordId) {
          console.log('CA::brief I am adding a CA indicator on ', recordId);
          // whenPageLoaded(addCulturalAdviceIndicatorToHeader(recordId, 'brief'));
          addCulturalAdviceIndicatorToHeader(recordId, `brief-${recordCount}`);
        }
      }
    },
    template: ''
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

// the Favourites Pin can have a help dialog floating below it
// because we have added our header above and the askus on the right, the onload pin location had moved,
// so the default dialog placement is wrong.
// when the pin is in its load position, move the dialog to sit below it by adding a class
// when the pin moves itself to the top corner (which is onscroll), remove our class
// (tried to do this by listening to the scroll event, but it was flakey - this is robust)
const favouritePinDialogTagName = 'prm-favorites-warning-message';
const favouritesPinDialogInitialPositionClassName = 'favouritesDialogInitialPosition';
function manageFavouritesPinDialogLocation() {
  setInterval(() => {
    const isFullDisplayPage = window.location.pathname.includes('fulldisplay');
    const favouritesPin = isFullDisplayPage
      ? document.querySelector('.full-view-inner-container prm-brief-result-container:first-child prm-save-to-favorites-button')
      : document.querySelector('prm-search-bookmark-filter [aria-label="Go to Favourites"]');
    const pinLocation = !!favouritesPin && favouritesPin.getBoundingClientRect();
    const favouritesDialog = document.querySelector(favouritePinDialogTagName);
    if (!favouritesPin || !pinLocation || !favouritesDialog) {
      // !favouritesPin && console.log('pin not found');
      // !pinLocation && console.log('pinLocation not found');
      // !favouritesDialog && console.log('dialog not found');
      return;
    }
    if (pinLocation.top > 50) {
      // page is at brief-result initial load layout - the Dialog must be moved down from where exlibris puts it
      // console.log(!!isFullDisplayPage ? 'full' : 'brief', 'position ', pinLocation.top, 'our class please');
      !favouritesDialog.classList.contains(favouritesPinDialogInitialPositionClassName) && favouritesDialog.classList.add(favouritesPinDialogInitialPositionClassName);
    } else {
      // the page has been scrolled and the favourites pin has shifted up to the top of the page - use the built in exlibris dialog position
      // console.log(!!isFullDisplayPage ? 'full' : 'brief', 'position ', pinLocation.top, 'default exlibris position');
      !!favouritesDialog.classList.contains(favouritesPinDialogInitialPositionClassName) && favouritesDialog.classList.remove(favouritesPinDialogInitialPositionClassName);
    }
  }, 250)
}

function loadFunctions() {
  manageFavouritesPinDialogLocation();
}

whenPageLoaded(loadFunctions);
