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

  // const loggedInMenu = (hide, id='mylibrary-list') => `<ul id="${id}" class="mylibrary-list"${!!hide ? ' style="display:none"' : ''}` + '>\n' +
  // const loggedInMenu = '<ul id="mylibrary-list" class="mylibrary-list">\n' +
  // const loggedInMenu = (id, hide) => `<!--<ul id="${id}" class="mylibrary-list"` + '>\n-->' +
  const loggedInMenu = (id, hide) => `<ul id="${id}" class="mylibrary-list"${!!hide ? ' style="display:none"' : ''}` + '>\n' +
      '    <li>\n' +
      '        <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="mylibrary-menu-borrowing" aria-label="Go to Library account" role="menuitem" onclick="location.href=\'https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/account?vid=61UQ_DEV&amp;section=overview&amp;lang=en_US\'">\n' +
      '            <svg viewBox="0 0 24 24" focusable="false">\n' +
      '                <path d="M2,3H22C23.05,3 24,3.95 24,5V19C24,20.05 23.05,21 22,21H2C0.95,21 0,20.05 0,19V5C0,3.95 0.95,3 2,3M14,6V7H22V6H14M14,8V9H21.5L22,9V8H14M14,10V11H21V10H14M8,13.91C6,13.91 2,15 2,17V18H14V17C14,15 10,13.91 8,13.91M8,6A3,3 0 0,0 5,9A3,3 0 0,0 8,12A3,3 0 0,0 11,9A3,3 0 0,0 8,6Z"></path>\n' +
      '            </svg>\n' +
      '            <div class="textwrapper">\n' +
      '                <span class="primaryText">Library account</span>\n' +
      '                <span class="subtext">Loans, requests &amp; settings</span>\n' +
      '            </div>\n' +
      '        </button>\n' +
      '    </li>\n' +
      '    <li>\n' +
      '        <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="mylibrary-menu-saved-items" aria-label="Go to Favourites" role="menuitem" onclick="location.href=\'https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/favorites?vid=61UQ_DEV&amp;lang=en_US&amp;section=items\'">\n' +
      '            <svg viewBox="0 0 24 24" focusable="false">\n' +
      '                <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>\n' +
      '            </svg>\n' +
      '            <div class="textwrapper">\n' +
      '                <span class="primaryText">Favourites</span>\n' +
      '                <span class="subtext">Saved items, searches &amp; search history</span>\n' +
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
      '        <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button" data-testid="mylibrary-menu-feedback" aria-label="Go to Feedback" role="menuitem" onclick="javascript:window.open(\'https://support.my.uq.edu.au/app/library/feedback\', \'_blank\');">\n' +
      '            <svg viewBox="0 0 24 24" focusable="false">\n' +
      '                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"></path>\n' +
      '            </svg>\n' +
      '            <div class="textwrapper">\n' +
      '                <span class="primaryText">Feedback</span>\n' +
      '                <span class="subtext"></span>\n' +
      '            </div>\n' +
      '        </button>\n' +
      '    </li>\n' +
      '</ul>';

  // prm-user-area-expandable-after
  app.component('prmUserAreaExpandableAfter', { // this was as close to the correct spot as I could get, so it has to be moved whenever it loads
    controller: function($scope){
      setInterval(() => {
        const sibling = document.querySelector('h2[translate="nui.menu"]');
        const desiredParentDesktop = !!sibling && sibling.parentNode;
        const usermenu = document.getElementById('mylibrary-list-desktop');
        if (!!usermenu && !!desiredParentDesktop) {
          const currentParent = usermenu.parentNode;
          if (!!currentParent && desiredParentDesktop !== currentParent) {
            // move all the items around
            desiredParentDesktop.appendChild(usermenu);

            // delete the items they provide because we have similar in our account links list
            const deletionClassList = [
              '.my-library-card-ctm',
              '.my-loans-ctm',
              '.my-requests-ctm',
              '.my-favorties-ctm',
              '.my-search-history-ctm',
              '.my-PersonalDetails-ctm',
            ];
            deletionClassList.forEach(e => {
              const elem = document.querySelector(e);
              !!elem && elem.remove();
            });

            // remove one of the dividers, having removed all the contents of the block
            const hr = document.querySelector('md-menu-divider')
            !!hr && hr.remove();
          }
        }
      }, 250);
    },
    template: loggedInMenu('mylibrary-list-desktop', false)
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
        console.log('MENU:: 8/7 remove element', selector, element);
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
    controller: function($scope){
      setInterval(() => {
        // mobile menu is only in the DOM when it has been opened
        const sibling = document.querySelector('md-dialog-content prm-authentication'); // entry that only occurs in mobile menu
        const usermenuId = 'mylibrary-list-mobile';
        const existingmenu = document.getElementById(usermenuId);
        if (!!sibling && !existingmenu) {
          console.log('sibling=', sibling);
          const desiredParentMobile = sibling.parentNode;
          console.log('desiredParentMobile=', desiredParentMobile);
          const clonableUsermenu = document.getElementById('mylibrary-list-mobile-cloneable');
          const usermenu = clonableUsermenu.cloneNode(true)
          !!usermenu && (usermenu.id = usermenuId);
          console.log('usermenu=', usermenu);
          if (!!usermenu && !!desiredParentMobile) {
            const currentParent = usermenu.parentNode;
            console.log('currentParent=', currentParent);
            if (desiredParentMobile !== currentParent) {
              // delete primo-defined account items
              const deletableItems = [
                'prm-library-card-menu',
              ];
              deletableItems.forEach(e => {
                const elem = document.querySelector(e);
                console.log('MENU:: 5/7 deleting', e, elem);
                !!elem && elem.remove();
              });

              // some built in items take a while to pop in - we need to remove the account button as the label is inappropriate and we are adding our own
              removeElementWhenItAppears('prm-library-card-menu'); // account button
              removeElementWhenItAppears('.settings-container .my-search-history-ctm'); // search history

              // delete any other items
              removeElementWhenItAppears('.settings-container > div > div', false);

              usermenu.style.display = 'block';
              desiredParentMobile.appendChild(usermenu);
            }
          }
        }
      }, 250);
    },
    template: loggedInMenu('mylibrary-list-mobile-cloneable', true)
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
