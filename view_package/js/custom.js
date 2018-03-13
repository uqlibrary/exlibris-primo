(function () {
  "use strict";

  var app = angular.module('viewCustom', ['angularLoad']);

  app.run(['$rootScope', '$location', '$window', function($rootScope, $location, $window){
    //record GA page view event to new primo tracker GA ID
    $rootScope.$on('$locationChangeSuccess', function(event){
      //temporarily create a tracker specifically to new Primo
      if ($window.ga) {
        $window.ga(function () {
          $window.ga('create', 'UA-4365437-14', 'search.library.uq.edu.au', 'NewPrimoTracker');
        });
        $window.ga('NewPrimoTracker.send', 'pageview', {location: $location.url()});
      }
    });

  }]);

  app.component('prmTopBarBefore', {
    template: '<div layout="row"><uqlibrary-alerts></uqlibrary-alerts></div>' +
    '<div layout="row"><uq-minimal-header show-login-button="false"></uq-minimal-header></div>'
  });

  /****************************************************************************************************/

  /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

  /*var app = angular.module('centralCustom', ['angularLoad']);*/

  /****************************************************************************************************/

  // Begin BrowZine - Primo Integration...
  // per https://thirdiron.atlassian.net/wiki/spaces/BrowZineAPIDocs/pages/79200260/Ex+Libris+Primo+Integration

  // Define Angular module and whitelist URL of server with Node.js script
  app.constant('nodeserver', "https://apiconnector.thirdiron.com/v1/libraries/1508")
    .config(['$sceDelegateProvider', 'nodeserver', function ($sceDelegateProvider, nodeserver) {
      var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
      urlWhitelist.push(nodeserver + '**');
      $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
    }]);

  // Add Article In Context & BrowZine Links
  app.controller('prmSearchResultAvailabilityLineAfterController', function($scope, $http, nodeserver) {
    var vm = this;
    $scope.book_icon = "https://s3.amazonaws.com/thirdiron-assets/images/integrations/browzine_open_book_icon.png";
    if (vm.parentCtrl.result.pnx.addata.doi && vm.parentCtrl.result.pnx.display.type[0] == 'article')  {
      vm.doi = vm.parentCtrl.result.pnx.addata.doi[0] || '';
      var articleURL = nodeserver + "/articles?DOI=" + vm.doi;
      $http.jsonp(articleURL, {jsonpCallbackParam: 'callback'}).then(function(response) {
        $scope.article = response.data;
      }, function(error){
        console.log(error);
      });
    }
    if (vm.parentCtrl.result.pnx.addata.issn && vm.parentCtrl.result.pnx.display.type[0] == 'journal')  {
      vm.issn = vm.parentCtrl.result.pnx.addata.issn[0].replace("-", "") || '';
      var journalURL = nodeserver + "/journals?ISSN=" + vm.issn;
      $http.jsonp(journalURL, {jsonpCallbackParam: 'callback'}).then(function(response) {
        $scope.journal = response.data;
      }, function(error){
        console.log(error);
      });
    }

  });

  // Below is where you can customize the wording that is displayed (as well as the hover over text) for the BrowZine links.
  // St Olaf has chosen "View Journal Contents" for the "Journal Availability Link" but other great options include things such as "View Journal" or "View this Journal"
  // St Olaf is using "View Issue Contents" for the "Article in Context" link but another great option is "View Complete Issue" or "View Article in Context".
  // St Olaf also has added a hover over link that says "Via BrowZine" to emphasize the interaction being used.

  app.component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchResultAvailabilityLineAfterController',
    template: '<div ng-if="article.data.browzineWebLink">' +
    '<a href="{{ article.data.browzineWebLink }}" target="_blank" title="Browzine displays a journal\'s entire table of contents and more.">' +
    '<img src="https://s3.amazonaws.com/thirdiron-assets/images/integrations/browzine_open_book_icon.png" class="browzine-icon">' +
    ' View issue contents in Browzine ' +
    '<md-icon md-svg-icon="primo-ui:open-in-new" aria-label="icon-open-in-new" role="img" class="browzine-external-link">' +
    '<svg id="open-in-new_cache29" width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">' +
    '</svg>' +
    '</md-icon>' +
    '</a>' +
    '</div>' +
    '<div ng-if="journal.data[0].browzineWebLink">' +
    '<a href="{{ journal.data[0].browzineWebLink }}" target="_blank" title="Browzine displays a journal\'s entire table of contents and more.">' +
    '<img src="https://s3.amazonaws.com/thirdiron-assets/images/integrations/browzine_open_book_icon.png" class="browzine-icon">' +
    ' View journal contents in Browzine ' +
    '<md-icon md-svg-icon="primo-ui:open-in-new" aria-label="icon-open-in-new" role="img" class="browzine-external-link">' +
    '<svg id="open-in-new_cache29" width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">' +
    '</svg>' +
    '</md-icon>' +
    '</a>' +
    '</div>'
  });

  // Add Journal Cover Images from BrowZine
  app.controller('prmSearchResultThumbnailContainerAfterController', function ($scope, $http, nodeserver) {
    var vm = this;
    var newThumbnail = '';
    // checking for item property as this seems to impact virtual shelf browse (for reasons as yet unknown)
    if (vm.parentCtrl.item && vm.parentCtrl.item.pnx.addata.issn) {
      vm.issn = vm.parentCtrl.item.pnx.addata.issn[0].replace("-", "") || '';
      var journalURL = nodeserver + "/journals?ISSN=" + vm.issn;
      $http.jsonp(journalURL, { jsonpCallbackParam: 'callback' }).then(function (response) {
        if (response.data.data["0"] && response.data.data["0"].browzineEnabled)  {
          newThumbnail = response.data.data["0"].coverImageUrl;
        }
      }, function (error) {
        console.log(error); //
      });
    }
    vm.$doCheck = function (changes) {
      if (vm.parentCtrl.selectedThumbnailLink) {
        if (newThumbnail !== '') {
          vm.parentCtrl.selectedThumbnailLink.linkURL = newThumbnail;
        }
      }
    };
  });

  app.component('prmSearchResultThumbnailContainerAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchResultThumbnailContainerAfterController'
  });
  // End BrowZine - Primo Integration

  /*
    * this is on hold until May, when the newspaper-articles exclusion will apparently move out of the url
    * Problems with this 'lock facets' code
    * it cant remove multiple facets on a subsequent load
    * eg
    * 1. search 'library' on homepage, load & lock facets newspaper_articles and reviews
    * 2. return to homepage and search 'books' - only one of 'reviews' and 'newspaper_articles' will be removed
    *
    * Incomplete:
    * - I havent quite got the physical items search working properly yet (&facet=tlevel,include,physical_items)
    *
    *
    * sample searches:
    * https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,frogs&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ_DEV&facet=rtype,include,books&facets=locked
    * https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,frogs&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ_DEV&facet=rtype,include,media&facets=locked
    * https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,frogs&tab=61uq_all&search_scope=61UQ_All&sortby=rank&vid=61UQ_DEV&facet=rtype,exclude,newspaper_articles&facet=rtype,exclude,reviews&offset=0&facets=locked
    *
   */

  // lock facets
  // Based on code supplied by Univerisity of Otago eg. https://otago.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,frogs&tab=default_tab&search_scope=All&vid=DUNEDIN&facet=rtype,exclude,reviews&offset=0&ref=http:%2F%2Fmarvin.otago.ac.nz
  // add '&facets=locked' tag to any referer to a search results page you want this to happen on
 app.controller('prmExploreMainAfterController', function($scope) {
    setTimeout(function(){
      var tag = "facets=locked";
      if (!(window.location.search.indexOf(tag) > 0 && window.location.search.indexOf("facet=") > 0)) {
        return;
      }

      waitForElementToDisplay('prm-breadcrumbs div div div button prm-icon > md-icon', 1000);

      function waitForElementToDisplay(selector, time) {
        if (document.querySelector(selector) !== null) {
          // in the case where this is a second search via the homepage, we need to unlock previous locked ones
          // this means we need to hard code a list to check, because this page doesnt know what other search options are provided on the home page
          // if any future queries add different facets, this list will have to be updated
          // key = value in url eg books in facet=rtype,exclude,books
          // value = value on aria-label element of button to be clicked
          var validFacets = {
            'reviews': 'Reviews',
            'books': 'Books',
            'newspaper_articles': 'Newspaper Articles',
            'articles': 'Articles',
            'media': 'Video & Audio',
            'physical_items': 'Physical items'
          };

          var queries = window.location.search.split('&');
          if (queries.length > 1) {
            var facetsInUrl = [];
            queries.map(function (e) {
              // get the facet in the from all the different types
              if (0 === e.indexOf("facet=rtype,exclude,")) {
                facetsInUrl.push(e.replace("facet=rtype,exclude,", ''));
              } else if (0 === e.indexOf("facet=rtype,include,")) {
                facetsInUrl.push(e.replace("facet=rtype,include,", ''));
              } else if (0 === e.indexOf("facet=tlevel,exclude,")) {
                facetsInUrl.push(e.replace("facet=tlevel,exclude,", ''));
              } else if (0 === e.indexOf("facet=tlevel,include,")) {
                facetsInUrl.push(e.replace("facet=tlevel,include,", ''));
              }
            });

            // do all the settings first because the later facet removal refreshes the page, losing our tag
            var facet, ariaLabel, facetSelector;
            for (facet in validFacets) {
              if (facetsInUrl.indexOf(facet) !== -1) {
                // found in the url - lock it
                ariaLabel = 'Make this filter persistent throughout the session ' + validFacets[facet];
                facetSelector = document.querySelector('[aria-label="' + ariaLabel + '"]');
                if (facetSelector !== null) {
                  angular.element(facetSelector).triggerHandler('click');
                }
              }
            }

            var thisFacet, ariaLabelLock, facetSelectorLock;
            for (facet in validFacets) {
              if (facetsInUrl.indexOf(facet) !== -1) {
                // skip any that are for this page
              } else {
                // remove a facet if it was locked from an earlier search
                thisFacet = validFacets[facet];
                ariaLabel = 'Remove Content type ' + thisFacet;
                facetSelector = document.querySelector('[aria-label="' + ariaLabel + '"]'); // the x (remove) button exists to click
                ariaLabelLock = 'Cancel persistence ' + thisFacet;
                facetSelectorLock = document.querySelector('[aria-label="' + ariaLabelLock + '"]'); // the 'locked' button exists - this is one we should remove
                if (facetSelector !== null && facetSelectorLock !== null) {
                  angular.element(facetSelector).triggerHandler('click');
                  //once this is clicked the page will refresh and wont have our tag on the end :(
                  // so only one is ever done :(
                }
              }
            }

            return;
          }
          else {
            setTimeout(function () {
              waitForElementToDisplay(selector, time);
            }, time);
          }
        }
      }
    }, 2500);
  });

  app.component('prmExploreMainAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmExploreMainAfterController'
  });
  // End lock facets


  function insertScript(url) {
    var script = document.querySelector("script[src*='"+url+"']");
    if (!script) {
      var heads = document.getElementsByTagName("head");
      if (heads && heads.length) {
        var head = heads[0];
        if (head) {
          script = document.createElement('script');
          script.setAttribute('src', url);
          script.setAttribute('type', 'text/javascript');
          head.appendChild(script);
        }
      }
    }
  }

  function insertLink(link) {
    var linkTag = document.querySelector("link[href*='"+link.href+"']");
    if (!linkTag) {
      var heads = document.getElementsByTagName("head");
      if (heads && heads.length) {
        var head = heads[0];
        if (head) {
          linkTag = document.createElement('link');
          linkTag.setAttribute('href', link.href);
          linkTag.setAttribute('rel', link.rel);
          head.appendChild(linkTag);
        }
      }
    }
  }

  var scripts = [
    '//assets.library.uq.edu.au/master/reusable-components/webcomponentsjs/webcomponents-lite.min.js',
    '//assets.library.uq.edu.au/master/reusable-components/resources/preloader.js',
    '//assets.library.uq.edu.au/master/reusable-components/primo2/load.js'
  ];

  var links = [
    { rel: 'import', href: '//assets.library.uq.edu.au/master/reusable-components/elements.vulcanized.html'},
    { rel: 'stylesheet', href: '//assets.library.uq.edu.au/master/reusable-components/primo2/custom-styles.css'}
  ];

  insertLink(links[0]);
  insertLink(links[1]);

  insertScript(scripts[0]);
  insertScript(scripts[1]);
  insertScript(scripts[2]);

})();
