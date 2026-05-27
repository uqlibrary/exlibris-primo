function whenPageLoaded(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
function insertScript(url) {
  var script = document.querySelector("script[src*='" + url + "']");
  if (!script) {
    var heads = document.getElementsByTagName("head");
    if (heads && heads.length) {
      var head = heads[0];
      if (head) {
        script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        script.setAttribute("defer", "");
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
        linkTag = document.createElement("link");
        linkTag.setAttribute("href", href);
        linkTag.setAttribute("rel", "stylesheet");
        head.appendChild(linkTag);
      }
    }
  }
}

function insertScripts() {
  let folder = null;
  if (window.location.hostname === "search.library.uq.edu.au") {
    if (vidParam === '61UQ_INST:61UQ_APPDEV') {
      folder = "-development/primo-prod-dev/";
    } else {
      folder = "/" // prod.
    }
  } else if (window.location.hostname === "uq.primo.exlibrisgroup.com") {
    // vid checks to come later
    if (window.location.pathname.startsWith('/nde')) {
      // nde development prod, Not used long term?
      folder = "-development/primo-nde-prod/";
    } else if (window.location.pathname.startsWith('/discovery')) {
      folder = "-development/primo-prod-dev/";
    }
  } else if (window.location.hostname === "uq-psb.primo.exlibrisgroup.com") {
    // sandbox
    // vid checks to come later
    if (window.location.pathname.startsWith('/nde')) {
      folder = "-development/primo-nde-sandbox/";
    } else if (window.location.pathname.startsWith('/discovery')) {
      folder = "-development/primo-sandbox-dev/";
    }
  } else if (window.location.hostname === 'localhost') {
    // comment out when not developing customisations (ugh!)
    folder = "-development/primo-nde-sandbox/";
  }

  if (!!folder) {
    // this script should only be called on views where we want UQ components, such as the purple header showing
    insertScript('https://assets.library.uq.edu.au/reusable-webcomponents' + folder + 'uq-lib-reusable.min.js');
    // // we don't yet need this script, but if we do it should be in this location
    // // insertScript('https://assets.library.uq.edu.au/reusable-webcomponents' + folder + 'applications/primo/load.js');
    insertStylesheet('https://assets.library.uq.edu.au/reusable-webcomponents' + folder + 'applications/primo/custom-styles.css');
    insertStylesheet('https://static.uq.net.au/v6/fonts/Roboto/roboto.css');
    insertStylesheet('https://static.uq.net.au/v9/fonts/Merriweather/merriweather.css');
    insertStylesheet('https://static.uq.net.au/v13/fonts/Montserrat/montserrat.css');
  } else {
    console.log('No script insertion.');
  }
}

function insertUqComponents() {
  const firstElement = document.body.children[0];
  if (!firstElement) {
    return;
  }
  const gtm = document.createElement('uq-gtm');
  !!gtm && gtm.setAttribute('gtm', 'GTM-NC7M38Q');
  document.body.insertBefore(gtm, firstElement);

  if (!document.querySelector('uq-header')) {
    const header = document.createElement('uq-header');
    !!header && header.setAttribute('hideLibraryMenuItem', '');
    !!header && header.setAttribute('searchurl', 'guides.library.uq.edu.au');
    document.body.insertBefore(header, firstElement);
  }

  if (!document.querySelector('uq-site-header')) {
    const siteHeader = document.createElement('uq-site-header');
    let breadcumbLabel = 'Library Search';
    if (window.location.hostname === 'uq.primo.exlibrisgroup.com') {
      breadcumbLabel = 'NDE UI Library Search';
    } else if (window.location.hostname === 'uq-psb.primo.exlibrisgroup.com') {
      breadcumbLabel = 'NDE UI Library Search (Sandbox)';
    }
    !!siteHeader && siteHeader.setAttribute('secondleveltitle', breadcumbLabel);
    !!siteHeader && siteHeader.setAttribute('secondlevelurl', 'https://www.library.uq.edu.au/');
    !!siteHeader && document.body.insertBefore(siteHeader, firstElement);

    // do something with auth
  }

  if (!document.querySelector('proactive-chat:not([display="inline"])')) {
    const proactiveChat = document.createElement('proactive-chat');
    !!proactiveChat && document.body.insertBefore(proactiveChat, firstElement);
  }

  if (!document.querySelector('alert-list')) {
    const alerts = document.createElement('alert-list');
    !!alerts && document.body.insertBefore(alerts, firstElement);
  }

  if (!document.querySelector('cultural-advice')) {
    const culturalAdvice = document.createElement('cultural-advice');
    !!culturalAdvice && document.body.insertBefore(culturalAdvice, firstElement);
  }

  if (!document.querySelector('uq-footer')) {
    const findMain = setInterval(() => {
        // on citation page, we have to wait for the main to be available
      const ndeRoot = document.querySelector('nde-app-root main');
      if (!ndeRoot) {
        return;
      }
      clearInterval(findMain);

      // has to be appended to main, higher in the tree puts it in the middle of the page?!?
      const subFooter = document.createElement('uq-footer');
      !document.querySelector('uq-footer') && !!subFooter && ndeRoot.appendChild(subFooter);
    }, 100);
  }
}

function loadFunctions() {
  insertScripts();
  insertUqComponents();
}

whenPageLoaded(loadFunctions);
