function whenPageLoaded(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

(function () {
	"use strict";

	var app = angular
		.module("viewCustom", ["angularLoad"])
		//per https://support.talis.com/hc/en-us/articles/115002712709-Primo-Explore-Integrations-with-Talis-Aspire and https://github.com/alfi1/primo-aspire-api/blob/master/getAspireLists_Angular1-6.js
		// Whitelisting
		.constant("AspireTrustBaseUrl", "https://uq.rl.talis.com/")
		.config([
			"$sceDelegateProvider",
			"AspireTrustBaseUrl",
			function ($sceDelegateProvider, AspireTrustBaseUrl) {
				var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
				urlWhitelist.push(AspireTrustBaseUrl + "**");
				$sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
			},
		]);

	function getSearchParam(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}
	const vidParam = getSearchParam('vid');
	const primoHomepageLink = `https://${window.location.hostname}/discovery/search?vid=${vidParam}&offset=0`;

	// this should only be needed for primo ve test - we should be back to 2 domains when VE goes live
	function isDomainPrimoVETest() {
		return window.location.hostname === "uq.primo.exlibrisgroup.com";
	}

	function getPrimoHomepageLabel() {
		// determine if we are in the public environment, colloquially referred to as prod-prod
		// (to distinguish it from prod-dev and sandbox-prod)
		const isPubliclyViewable = isDomainProd() && getSearchParam('vid') === '61UQ_INST:61UQ';

		// modifier possibilities:
		// 61UQ_INST:61UQ            => "PROD" (unless public domain)
		// 61UQ_INST:61UQ_APPDEV     => "APPDEV"
		// 61UQ_INST:61UQ_DALTS      => "DALTS" (formerly DAC)
		// 61UQ_INST:61UQ_CANARY     => "CANARY"
		const labelModifier = isPubliclyViewable ? '' : vidParam.replace('61UQ_INST:61UQ_', '');
		let primoHomepageLabel;
		if (isDomainProd()) {
			primoHomepageLabel = `Library Search${labelModifier}`
		} else if (isDomainPrimoVETest()) { // this `else if` can be removed when Primo VE goes live, because only prod and sandbox will exist
			primoHomepageLabel = `PRIMO VE TEST ${labelModifier}`;
			if (vidParam === '61UQ_INST:61UQ') {
				primoHomepageLabel = `PRIMO VE TEST PROD`;
			}
		} else { // sandbox domain
			primoHomepageLabel = `SANDBOX VE ${labelModifier}`;
		}
		return primoHomepageLabel;
	}

	app.component("prmTopBarBefore", {
		// we found it was more robust to insert the alerts list in the different page location via primo angular, see below,
		// so completely skip inserting elements "by attribute"
		template:
			'<uq-gtm gtm="GTM-NC7M38Q"></uq-gtm>' +
			'<uq-header hideLibraryMenuItem="true" searchLabel="library.uq.edu.au" searchURL="http://library.uq.edu.au" skipnavid="searchBar"></uq-header>' +
			`<uq-site-header secondleveltitle="${(getPrimoHomepageLabel())}" secondlevelurl="${primoHomepageLink}"></uq-site-header>` +
			"<proactive-chat></proactive-chat>",
	});

	app.component("prmTopbarAfter", {
		template:
			'<alert-list system="primo"></alert-list>' +
			'<cultural-advice></cultural-advice>'
		,
	});

	// account options is a built in primo but that we alter, but cant directly offer the same functionality it does
	const accountLinkOptions = {
		title: "Library account",
		id: "mylibrary-menu-borrowing",
		svgString: '<svg data-testid="library-account-icon" id="library-account-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M12 3C14.2222 3 16 4.77778 16 7C16 9.22222 14.2222 11 12 11C9.77778 11 8 9.22222 8 7C8 4.77778 9.77778 3 12 3Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M4.59961 20.5716C4.59961 16.4685 7.91578 13.1523 12.0188 13.1523C16.1219 13.1523 19.438 16.4685 19.438 20.5716" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>',
		svgId: 'library-account-icon',
	};
	const favouriteLinkOptions = {
		title: "Favourites",
		id: "mylibrary-menu-saved-items",
		svgString: '<svg data-testid="library-favourites-icon" id="library-favourites-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M12.6988 3.43449L14.9056 7.8896C14.9557 8.00269 15.0347 8.10063 15.1345 8.17369C15.2344 8.24675 15.3516 8.29235 15.4746 8.30597L20.3461 9.02767C20.4871 9.04581 20.6201 9.1037 20.7294 9.19458C20.8388 9.28545 20.9201 9.40559 20.9639 9.54094C21.0074 9.67627 21.0117 9.82125 20.9761 9.95891C20.9404 10.0966 20.8663 10.2213 20.7625 10.3184L17.2511 13.802C17.1615 13.8857 17.0942 13.9905 17.0554 14.1069C17.0167 14.2232 17.0075 14.3474 17.0291 14.4682L17.8757 19.3674C17.9001 19.5081 17.8847 19.653 17.831 19.7854C17.7771 19.9178 17.6873 20.0325 17.5717 20.1163C17.456 20.2003 17.3191 20.25 17.1765 20.2598C17.0339 20.2698 16.8915 20.2394 16.7654 20.1724L12.3796 17.8546C12.2673 17.7995 12.1439 17.7708 12.0188 17.7708C11.8936 17.7708 11.7702 17.7995 11.6579 17.8546L7.27219 20.1724C7.14601 20.2394 7.00355 20.2698 6.861 20.2598C6.71845 20.25 6.58153 20.2003 6.46585 20.1163C6.35016 20.0325 6.26034 19.9178 6.2066 19.7854C6.15286 19.653 6.13737 19.5081 6.16188 19.3674L7.00849 14.4127C7.02995 14.2919 7.02087 14.1677 6.98209 14.0514C6.9433 13.935 6.87604 13.8302 6.78643 13.7465L3.23344 10.3184C3.12833 10.2186 3.05441 10.0905 3.02063 9.94953C2.98686 9.80858 2.99468 9.66085 3.04315 9.52425C3.09162 9.38766 3.17866 9.26805 3.29372 9.17991C3.40879 9.09178 3.54694 9.0389 3.69145 9.02767L8.56292 8.30597C8.68589 8.29235 8.80314 8.24675 8.90298 8.17369C9.00281 8.10063 9.08177 8.00269 9.13195 7.8896L11.3387 3.43449C11.3988 3.30474 11.4947 3.19489 11.6153 3.1179C11.7358 3.04091 11.8758 3 12.0188 3C12.1617 3 12.3018 3.04091 12.4223 3.1179C12.5428 3.19489 12.6387 3.30474 12.6988 3.43449Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>',
		link: `/discovery/favorites?vid=${vidParam}&lang=en&section=items`,
		svgId: 'library-favourites-icon',
	}; // searchHistoryOptions
	const searchHistoryOptions = {
		title: "Search history",
		id: "mylibrary-menu-search-history",
		svgString: '<svg data-testid="library-search-history-icon" id="library-search-history-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
			'<path d="M6.78771 6.69579C8.04789 5.28681 9.76183 4.36381 11.6318 4.08712C13.5017 3.81043 15.4095 4.19754 17.0237 5.1812C18.6379 6.16487 19.8566 7.68292 20.4679 9.47165C21.0792 11.2604 21.0446 13.2067 20.3701 14.9726C19.6956 16.7385 18.4238 18.2123 16.7757 19.138C15.1275 20.0636 13.2072 20.3827 11.3482 20.0397C9.48931 19.6968 7.80926 18.7135 6.59994 17.2606C5.39063 15.8077 4.72848 13.9771 4.72852 12.0868V11.2356" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M6.8564 13.7891L4.72825 11.2354L2.6001 13.7891" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M12.8154 8.25586V12.5122H15.7948" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>',
		link: `/discovery/favorites?vid=${vidParam}&amp;lang=en&amp;section=search_history`,
		svgId: 'library-search-history-icon',
	};
	const feedbackOptions = {
		title: "Feedback",
		ariaLabel: "Provide feedback",
		link: "https://support.my.uq.edu.au/app/library/feedback",
		id: "mylibrary-menu-feedback",
		svgString: '<svg data-testid="library-feedback-icon" id="library-feedback-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M19.7998 17.3998H11.3999L6.59995 20.9998V17.3998H4.19998C3.88173 17.3998 3.57651 17.2734 3.35147 17.0483C3.12643 16.8233 3 16.5181 3 16.1998V4.19998C3 3.88173 3.12643 3.57651 3.35147 3.35147C3.57651 3.12643 3.88173 3 4.19998 3H19.7998C20.118 3 20.4233 3.12643 20.6483 3.35147C20.8733 3.57651 20.9998 3.88173 20.9998 4.19998V16.1998C20.9998 16.5181 20.8733 16.8233 20.6483 17.0483C20.4233 17.2734 20.118 17.3998 19.7998 17.3998Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M6.59961 8.39941H17.3995" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M6.59961 12H14.9995" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>',
		newWindow: true,
		className: "my-feedback-ctm",
		svgId: 'library-feedback-icon',
	};

	function ourFeedbackMenuItem(feedbackId) {
		return `<md-menu-item id="${feedbackId}" data-testid="${feedbackId}" class="uql-account-menu-option">\n` +
			`<button class="desktop-feedback button-with-icon md-primoExplore-theme md-ink-ripple" type="button"` +
			`        data-analyticsid="${feedbackOptions.id}" aria-label="${feedbackOptions.ariaLabel}" role="menuitem"` +
			`        onclick="javascript:window.open('${feedbackOptions.link}', '_blank');">\n` +
			feedbackOptions.svgString +
			'    <div class="textwrapper">\n' +
			`        <span class="primaryText">${feedbackOptions.title}</span>\n` +
			"    </div>\n" +
			"</button>\n" +
			"</md-menu-item>\n";
	}

	const favouritesItemId = `${favouriteLinkOptions.id}Wrapper`;
	function ourFavouritesMenuItem() {
		return `<md-menu-item id="${favouritesItemId}" data-testid="${favouritesItemId}" class="uql-account-menu-option">\n` +
			'    <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button"' +
			`			data-analyticsid="${favouriteLinkOptions.id}" aria-label="Go to ${favouriteLinkOptions.title}"` +
			`			role="menuitem" onclick="location.href='${favouriteLinkOptions.link}'">\n` +
			favouriteLinkOptions.svgString +
			'        <div class="textwrapper">\n' +
			`             <span class="primaryText">${favouriteLinkOptions.title}</span>\n` +
			"        </div>\n" +
			"    </button>\n" +
			"</md-menu-item>\n";
	}

	function ourLearningResourceMenuItem() {
		const ICON_SVG_ACADEMIC_HAT = 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z';
		return '<md-menu-item data-testid="uqlLearningResourceMenuItem" class="uql-account-menu-option">\n' +
			'    <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button"' +
			'			data-analyticsid="mylibrary-menu-course-resources" aria-label="Go to Learning resources" role="menuitem"' +
			'			onclick="javascript:window.open(\'https://www.library.uq.edu.au/learning-resources\', \'_blank\');">\n' +
			'<svg data-testid="library-learning-resources-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M11.9999 21.4003V6.78587C11.9999 6.78587 9.94278 4.51443 2.99986 4.42871C2.87129 4.42871 2.78558 4.47157 2.69986 4.55728C2.61415 4.643 2.57129 4.72871 2.57129 4.85729V18.5717C2.57129 18.786 2.74272 19.0003 2.99986 19.0003C9.94278 19.1288 11.9999 21.4003 11.9999 21.4003Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M9.46999 12.2291C8.05569 11.7577 6.55568 11.4577 5.05566 11.3291" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M9.46999 15.7428C8.05569 15.2713 6.55568 14.9713 5.05566 14.8428" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M14.5293 12.2291C15.9436 11.7577 17.4436 11.4577 18.9436 11.3291" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M14.5293 15.7428C15.9436 15.2713 17.4436 14.9713 18.9436 14.8428" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M12.001 21.4003V6.78587C12.001 6.78587 14.0581 4.51443 21.001 4.42871C21.1296 4.42871 21.2153 4.47157 21.3011 4.55728C21.3868 4.643 21.4296 4.72871 21.4296 4.85729V18.5717C21.4296 18.786 21.2582 19.0003 21.001 19.0003C14.0581 19.1288 12.001 21.4003 12.001 21.4003Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			"</svg>\n" +
			'        <div class="textwrapper">\n' +
			'            <span class="primaryText">Learning resources</span>\n' +
			"        </div>\n" +
			"    </button>\n" +
			"</md-menu-item>\n";
	}

	function ourPrintBalanceMenuItem() {
		// const ICON_SVG_PRINTER = 'M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z';
		return '<md-menu-item data-testid="ourPrintBalanceMenuItem" class="uql-account-menu-option">\n' +
			'    <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button"' +
			'			data-analyticsid="mylibrary-menu-print-balance" aria-label="Go to Print balance" role="menuitem"' +
			'			onclick="javascript:window.open(\'https://web.library.uq.edu.au/library-and-student-it-help/print-scan-and-copy/your-printing-account\', \'_blank\');">\n' +
			'<svg data-testid="library-print-balance-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
			'<g clip-path="url(#clip0_1723_14098)">' +
			'<path d="M3.01562 12C3.01563 14.3828 3.96219 16.668 5.64709 18.3529C7.33198 20.0378 9.6172 20.9844 12 20.9844C14.3828 20.9844 16.668 20.0378 18.3529 18.3529C20.0378 16.668 20.9844 14.3828 20.9844 12C20.9844 9.6172 20.0378 7.33198 18.3529 5.64709C16.668 3.96219 14.3828 3.01563 12 3.01562C9.6172 3.01563 7.33198 3.96219 5.64709 5.64709C3.96219 7.33198 3.01563 9.6172 3.01562 12Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M10.2031 13.7969C10.2031 14.1523 10.3085 14.4997 10.506 14.7952C10.7034 15.0907 10.984 15.321 11.3124 15.457C11.6407 15.593 12.002 15.6286 12.3506 15.5592C12.6991 15.4899 13.0193 15.3188 13.2706 15.0675C13.5219 14.8162 13.693 14.496 13.7623 14.1474C13.8317 13.7989 13.7961 13.4376 13.6601 13.1092C13.5241 12.7809 13.2938 12.5003 12.9983 12.3028C12.7028 12.1054 12.3554 12 12 12C11.6446 12 11.2972 11.8946 11.0017 11.6972C10.7062 11.4997 10.4759 11.2191 10.3399 10.8908C10.2039 10.5624 10.1683 10.2011 10.2377 9.85257C10.307 9.50401 10.4781 9.18384 10.7294 8.93254C10.9807 8.68125 11.3009 8.51011 11.6494 8.44078C11.998 8.37144 12.3593 8.40703 12.6876 8.54303C13.016 8.67903 13.2966 8.90934 13.494 9.20484C13.6915 9.50033 13.7969 9.84774 13.7969 10.2031" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M12 7.20801V8.40592" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M12 15.5938V16.7917" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</g>' +
			'<defs>' +
			'<clipPath id="clip0_1723_14098">' +
			'<rect width="20" height="20" fill="white" transform="translate(2 2)"/>' +
			'</clipPath>' +
			'</defs>' +
			'</svg>\n' +
			'        <div class="textwrapper">\n' +
			'            <span class="primaryText">Print balance</span>\n' +
			"        </div>\n" +
			"    </button>\n" +
			"</md-menu-item>\n";
	}

	function ourRoomBookingMenuItem() {
		const ICON_SVG_HOTEL_DESK_BELL = 'M2 17h20v2H2zm11.84-9.21c.1-.24.16-.51.16-.79 0-1.1-.9-2-2-2s-2 .9-2 2c0 .28.06.55.16.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21z';
		return '    <md-menu-item data-testid="uqlRoomBookingMenuItem" class="uql-account-menu-option">\n' +
			'    <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button"' +
			'			data-analyticsid="mylibrary-menu-room-bookings" aria-label="Go to Book a room or desk" role="menuitem"' +
			'			onclick="javascript:window.open(\'https://uqbookit.uq.edu.au/#/app/booking-types/77b52dde-d704-4b6d-917e-e820f7df07cb\', \'_blank\');">\n' +
			'<svg data-testid="library-room-booking-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M2.18907 3.41406H17.8109C18.467 3.41406 19 3.94588 19 4.60043V17.8141C19 18.4686 18.467 19.0004 17.8109 19.0004H2.18907C1.53303 19.0004 1 18.4686 1 17.8141V4.60043C1 3.94588 1.53303 3.41406 2.18907 3.41406Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M1 8.2002H18.5399" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M5.79688 5.21364V1" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			'<path d="M14.2441 5.21364V1" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>' +
			"</svg>" +
			'        <div class="textwrapper">\n' +
			'            <span class="primaryText">Book a room or desk</span>\n' +
			"        </div>\n" +
			"    </button>\n" +
			"</md-menu-item>\n";
	}

	// remove their icon and insert one we like - icons provided by OMC
	function rewriteProvidedPrimoButton(buttonOptions, primoIdentifier) {
		const button = document.querySelector(primoIdentifier + " button");
		if (!button) {
			return;
		}

		const awaitSVG = setInterval(() => {
			const cloneableSvg = document.querySelector(primoIdentifier + " svg");
			if (!!cloneableSvg) {
				clearInterval(awaitSVG);

				// clean primo-provided insides of button
				const removablePrm = document.querySelector(primoIdentifier + ' prm-icon');
				!!removablePrm && removablePrm.remove();
				const removableSpan = document.querySelector(primoIdentifier + ' span');
				!!removableSpan && removableSpan.remove();
				const removableDiv = document.querySelector(primoIdentifier + ' div');
				!!removableDiv && removableDiv.remove();

				// add our icon
				const svgTemplate = document.createElement('template');
				svgTemplate.innerHTML = buttonOptions.svgString.trim();
				!!button && !!svgTemplate && button.appendChild(svgTemplate.content.firstChild);

				// add our label
				const primaryText = document.createTextNode(buttonOptions.title);
				const primaryTextBlock = document.createElement('span');
				!!primaryTextBlock && (primaryTextBlock.className = 'primaryText');
				!!primaryTextBlock && !!primaryText && primaryTextBlock.appendChild(primaryText);

				const textParent = document.createElement('div');
				!!textParent && (textParent.className = 'textwrapper');
				!!textParent && !!primaryTextBlock && textParent.appendChild(primaryTextBlock);
				!!button && !!textParent && button.appendChild(textParent);

				const menuItem = document.querySelector(primoIdentifier + ' button');
				!!menuItem && menuItem.setAttribute('data-analyticsid', buttonOptions.id); // add an ID for GTM usage to the button
				!!menuItem && menuItem.setAttribute('data-testid', buttonOptions.id);

				const svgAlreadyAttached = document.querySelector(primoIdentifier + ' button svg#' + buttonOptions.svgId)
				if (!!svgAlreadyAttached) {
					return; // we've already done the replacement
				}
				!!menuItem && !!button && menuItem.appendChild(button);
			}
		}, 250);
	}

	function createLabelledButton(buttonOptions) {
		const button = document.createElement("button");

		// add our icon
		const svgTemplate = document.createElement('template');
		svgTemplate.innerHTML = buttonOptions.svgString.trim();
		!!button && (button.id = buttonOptions.id);
		!!button && !!svgTemplate && button.appendChild(svgTemplate.content.firstChild);

		// add our insides to the  button!
		const primaryText = document.createTextNode(buttonOptions.title);
		const primaryTextBlock = document.createElement("span");
		!!primaryTextBlock && (primaryTextBlock.className = "primaryText");
		!!primaryTextBlock && !!primaryText && primaryTextBlock.appendChild(primaryText);

		const textParent = document.createElement("div");
		!!textParent && (textParent.className = "textwrapper");
		!!textParent && !!primaryTextBlock && textParent.appendChild(primaryTextBlock);
		!!button && !!textParent && button.appendChild(textParent);

		return button;
	}

	const MOBILE_LOGGED_IN_FEEDBACK_ID = 'bottommostItemId';
	const DESKTOP_LOGGED_IN_FEEDBACK_ID = 'desktop-loggedin-feedback-item'
	const MOBILE_LOGGED_OUT_FEEDBACK_ID = 'mobile-loggedout-feedback-item';
	const DESKTOP_LOGGED_OUT_FEEDBACK_ID = 'loggedout-desktop-feedback';

	// prm-user-area-expandable-after
	app.component("prmUserAreaExpandableAfter", {
		// HANDLE LOGGED IN MENU
		controller: function ($scope) {
			setInterval(() => {
				const isLoggedOut = document.querySelector(".sign-in-btn-ctm");
				if (!!isLoggedOut) {
					return;
				}

				const desiredParentDesktop = document.querySelector('md-menu-content.prm-user-menu-content');

				const desktopWrapper = document.querySelector('div.md-open-menu-container');
				const style = !!desktopWrapper && window.getComputedStyle(desktopWrapper);
				const isDesktopMenuOpen = !!style && style.display === "none";

				const mobilesibling = document.querySelector('md-dialog-content prm-authentication'); // entry that only occurs in mobile menu
				const isMobileMenuOpen = !!mobilesibling;
				if (isMobileMenuOpen) {
					// mobile menu is open - add the Account Links to the mobile menu and remove the links we dont want
					const desiredParentMobile = !!mobilesibling && mobilesibling.parentNode;
					// mobile menu is only in the DOM when the menu-open-button has been clicked, so create a new menu each time
					const createdMenuItem = document.querySelector(`div.mobile-main-menu-bg #${MOBILE_LOGGED_IN_FEEDBACK_ID}`);
					if (!createdMenuItem) {
						desiredParentMobile.insertAdjacentHTML('beforeend', ourFavouritesMenuItem());
						desiredParentMobile.insertAdjacentHTML('beforeend', ourLearningResourceMenuItem());
						desiredParentMobile.insertAdjacentHTML('beforeend', ourPrintBalanceMenuItem());
						desiredParentMobile.insertAdjacentHTML('beforeend', ourRoomBookingMenuItem());
						desiredParentMobile.insertAdjacentHTML('beforeend', ourFeedbackMenuItem(MOBILE_LOGGED_IN_FEEDBACK_ID));

						// delete primo-defined account items
						const deletableItems = ["prm-library-card-menu"];
						deletableItems.forEach((e) => {
							const elem = document.querySelector(e);
							!!elem && elem.remove();
						});

						rewriteProvidedPrimoButton(accountLinkOptions, 'prm-library-card-menu');

						// delete the search history over and over and over....
						removeElementWhenItAppears(".my-search-history-ctm");

						// delete any other items
						removeElementWhenItAppears('.settings-container > div > div', false);

						// delete the user name area
						const userNameArea = document.querySelector('.mobile-main-menu-bg .user-menu-header')
						!!userNameArea && userNameArea.remove()

						// if the mobile menu is closed then opened again, the built-in account link goes away. Weird.
						// Let's replace it manually.
						const waitForBuiltInAccountButtonToFirstExist = setInterval(() => {
							// we don't start waiting for the built-in account button to be missing until it has actually appeared
							const builtInAccountButtonFirst = document.querySelector(
								'.mobile-main-menu-bg [aria-label="Go to library account"]'
							);
							if (!builtInAccountButtonFirst) {
								return;
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
									clearInterval(waitForBuiltInAccountButtonToFirstExist);
								}
							}, 100); // never stop waiting, that second open may be a long time before it happens
						}, 100);
					}
				} else if (isDesktopMenuOpen) {
					const createdMenuItem = document.getElementById(DESKTOP_LOGGED_IN_FEEDBACK_ID);
					if (!createdMenuItem) {

						// append new Account links to existing menu
						// note: we use the native favourites on desktop
						desiredParentDesktop.insertAdjacentHTML('beforeend', ourLearningResourceMenuItem());
						desiredParentDesktop.insertAdjacentHTML('beforeend', ourPrintBalanceMenuItem());
						desiredParentDesktop.insertAdjacentHTML('beforeend', ourRoomBookingMenuItem());
						desiredParentDesktop.insertAdjacentHTML('beforeend', ourFeedbackMenuItem(DESKTOP_LOGGED_IN_FEEDBACK_ID));

						// move the logout button to the bottom. in a wrapper
						const logoutButton = document.querySelector('md-menu-item .user-menu-header button');
						const logoutWrapper = document.createElement("md-menu-item");
						!!logoutWrapper && logoutWrapper.classList.add('uql-account-menu-option');
						!!logoutWrapper && logoutWrapper.classList.add('logout-option');

						!!logoutWrapper && !!logoutButton && logoutWrapper.appendChild(logoutButton);
						!!desiredParentDesktop && !!logoutWrapper && desiredParentDesktop.appendChild(logoutWrapper);

						// remove the "logged in as [name]" notice
						const nameNotice = document.querySelector('md-menu-content md-menu-item');
						!!nameNotice && nameNotice.remove();

						// delete the items they provide because we have similar in our account links list
						const deletionClassList = [
							".my-loans-ctm",
							".my-requests-ctm",
							".my-search-history-ctm",
							".my-PersonalDetails-ctm",
						];
						deletionClassList.forEach((e) => {
							const elem = e.startsWith('.') ? document.querySelector(e) : document.getElementById(e);
							!!elem && elem.remove();
						});

						rewriteProvidedPrimoButton(accountLinkOptions, '.my-library-card-ctm', 'library-account-icon');

						rewriteProvidedPrimoButton(favouriteLinkOptions, '.my-favorties-ctm', 'library-favourites-icon');

						// remove the dividers, having removed all the contents of the block
						const hr1 = document.querySelector("md-menu-divider");
						!!hr1 && hr1.remove();
						const hr2 = document.querySelector("md-menu-divider");
						!!hr2 && hr2.remove();
					}
				}
			}, 250);
		},
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
					element.forEach((e) => e.remove());
				}
			}
			loopCount++;
		}, timeout);
	}

	app.component("prmExploreFooterAfter", { // prm-explore-footer-after
		// HANDLE LOGGED OUT VIEW
		controller: function ($scope) {
			const awaitLoggedout = setInterval(() => {
				const isLoggedOut = document.querySelector(".sign-in-btn-ctm");
				if (!isLoggedOut) {
					return;
				}

				const isDesktopMenuOpen = document.querySelector('prm-user-area-expandable md-menu');
				const isMobileMenuAvailable = document.querySelector('.mobile-menu-button');
				if (!!isMobileMenuAvailable)  {
					clearInterval(awaitLoggedout);
					setInterval(() => {
						// don't clear this interval - we have to re add each time the menu opens :(
						const mobilesibling = document.querySelector('prm-main-menu prm-library-card-menu'); // entry that only occurs in mobile logged out menu
						const desiredParentMobile = !!mobilesibling && mobilesibling.parentNode;

						const feedbackId = MOBILE_LOGGED_OUT_FEEDBACK_ID; // unique to mobile logged out
						const createdFeedbackMenuItem = document.getElementById(feedbackId);
						if (!!desiredParentMobile && !createdFeedbackMenuItem) {
							desiredParentMobile.insertAdjacentHTML('beforeend', ourFeedbackMenuItem(feedbackId));

							const feedbackMenuItem = document.getElementById(feedbackId);
							!!feedbackMenuItem && feedbackMenuItem.classList.add(feedbackId);
							const feedbackButton = document.querySelector(`#${feedbackId} button`);
							!!feedbackButton && feedbackButton.classList.add('md-button');
							!!feedbackButton && feedbackButton.classList.remove('desktop-feedback')
							const feedbackSvg = document.querySelector(`#${feedbackId} svg`);
							!!feedbackSvg && feedbackSvg.classList.add(feedbackId);

							const accountButtonOptions = {
								...accountLinkOptions,
								id: 'mobile-menu-logged-out-account',
							};
							rewriteProvidedPrimoButton(accountButtonOptions, 'md-dialog-content prm-main-menu prm-library-card-menu');
							rewriteProvidedPrimoButton(searchHistoryOptions, 'md-dialog-content prm-main-menu .my-search-history-ctm');
						}

						removeElementWhenItAppears('.settings-container prm-authentication'); // "Log in" menu item that duplicates "My account" function
					// }, 5000);
					}, 100);
				} else if (!!isDesktopMenuOpen) { // is desktop menu
					clearInterval(awaitLoggedout);

					const waitForDesktopFeedbackLink = setInterval(() => {
						const feedbackButton = document.getElementById(DESKTOP_LOGGED_OUT_FEEDBACK_ID);
						if (!feedbackButton) {
							// clearInterval(waitForDesktopFeedbackLink);

							rewriteProvidedPrimoButton(accountLinkOptions, '.my-library-card-ctm');
							rewriteProvidedPrimoButton(favouriteLinkOptions, '.my-favorties-ctm');
							rewriteProvidedPrimoButton(searchHistoryOptions, '.my-search-history-ctm');

							// insert new account links at end of menu area
							const plannedParent = document.querySelector("md-menu-content");

							const createdMenuItem = document.getElementById(DESKTOP_LOGGED_OUT_FEEDBACK_ID);
							if (!!plannedParent && !createdMenuItem) {
								plannedParent.insertAdjacentHTML('beforeend', ourFeedbackMenuItem(DESKTOP_LOGGED_OUT_FEEDBACK_ID));

								const feedbackmenuitem = document.getElementById(DESKTOP_LOGGED_OUT_FEEDBACK_ID);
								!!feedbackmenuitem && feedbackmenuitem.classList.add('my-feedback-ctm'); // needed?
							}
						}
					}, 100);
				}
			}, 100);
		},
	});

	app.component("prmSearchBookmarkFilterAfter", { // prm-search-bookmark-filter-after
		controller: function ($scope) {
			// move the primo-login-bar up so it overlaps uq-site-header and is visually one bar
			var primoLoginBar = document.querySelector('prm-topbar>div.top-nav-bar.layout-row') || false;
			!!primoLoginBar && !primoLoginBar.classList.contains('mergeup') && primoLoginBar.classList.add('mergeup');

			// add label to qrcode button in built-in primo utility area buttons (will be restyled with css)
			const awaitQrCodeButton = setInterval(() => {
				const qrCodeButton = document.querySelector('prm-search-bookmark-filter button');
				if (!!qrCodeButton) {
					const copyLabel = document.createElement('span');
					!!copyLabel && copyLabel.classList.add('qr-button-label', 'utility-button-labels');
					!!copyLabel && (copyLabel.textContent = 'QR');
					!!copyLabel && !!qrCodeButton && qrCodeButton.appendChild(copyLabel)

					clearInterval(awaitQrCodeButton);
				}
			}, 100);

			// add label to favourites link in built-in primo utility area buttons (will be restyled with css)
			// replace whenever unavailable
			const pinLabelId = 'pinLinkLabel';
			setInterval(() => {
				const pinLabel = document.getElementById(pinLabelId);
				if (!pinLabel) {
					const pinLink = document.querySelector('prm-search-bookmark-filter div#fixed-buttons-holder a');
					const pinLabelElement = document.createElement('span');
					const ariaLabelText = !!pinLabelElement && pinLabelElement.ariaLabel;
					!!pinLabelElement && (pinLabelElement.id = pinLabelId);
					!!pinLabelElement && (pinLabelElement.id = pinLabelId);
					!!pinLabelElement && pinLabelElement.classList.add('pin-button-label', 'utility-button-labels');
					const suppliedButtonLabel = !!ariaLabelText ? ariaLabelText.replace('Go to ', '') : null;
					const defaultButtonLabel = document.location.pathname === '/primo-explore/favorites' ? 'Search' : 'Favourites'
					!!pinLabelElement
					&& (pinLabelElement.textContent = suppliedButtonLabel || defaultButtonLabel);
					!!pinLabelElement && !!pinLink && pinLink.appendChild(pinLabelElement)
				}
			}, 100);

			// add a "help" button that links to help content
			const buttonId = 'utility-bar-primo-guide';
			const popupId = 'utility-bar-primo-help-popup';
			const helpTextLabel = 'Library Search help';
			const waitForLink = setInterval(() => {
				const helpButton = document.getElementById(buttonId);
				if (!helpButton) {
					return;
				}
				clearInterval(waitForLink);

				helpButton.classList.add('utility-help-button'); // , 'md-button', 'md-icon-button'

				helpButton.addEventListener('keyup', handleKeyUp);
				helpButton.addEventListener('blur', handleClosePopup);
				helpButton.addEventListener('mouseenter', handleMouseEnter);
				helpButton.addEventListener('mouseleave', handleClosePopup);
				window.addEventListener('scroll', () => {
					handleClosePopup();
				});

				function handleKeyUp(event) {
					if (event.key === 'Tab') {
						event.preventDefault();
						setTimeout(() => {
							addHelpDialog(popupId, helpTextLabel, helpButton);
						}, 200);
					}
				}

				function handleMouseEnter() {
					setTimeout(() => {
						addHelpDialog(popupId, helpTextLabel, helpButton);
					}, 500);
				}

				function handleClosePopup() {
					removeHelpDialog(popupId);
				}
			}, 100);

			function addHelpDialog(popupId, helpText, attachedParent) {
				const primaryText = document.createTextNode(helpText);

				const span = document.createElement('span');
				!!primaryText && !!span && span.appendChild(primaryText);

				const tooltip = document.createElement('md-tooltip');
				!!tooltip && tooltip.setAttribute('md-direction', '');
				!!tooltip && tooltip.classList.add('md-panel', 'md-tooltip', 'md-origin-bottom', 'md-primoExplore-theme', 'md-show');
				!!tooltip && tooltip.setAttribute('tabindex', '-1');
				!!tooltip && tooltip.setAttribute('role', 'tooltip');
				!!tooltip && tooltip.setAttribute('style', 'pointer-events: all;');
				!!span && !!tooltip && tooltip.appendChild(span);

				const wrapper2 = document.createElement('div');
				!!wrapper2 && wrapper2.classList.add('md-panel-inner-wrapper');
				!!wrapper2 && (wrapper2.style.zIndex = '101');

				const attachedParentPosition = attachedParent?.getBoundingClientRect() || null;
				const attachedParentBottom = attachedParentPosition?.bottom;
				!!wrapper2 && (wrapper2.style.top = `${attachedParentBottom}px`);

				const newRight = 125; // if this is reused it will need clever code to figure out horizontal placement
				!!wrapper2 && (wrapper2.style.right = `${newRight}px`);

				!!tooltip && !!wrapper2 && wrapper2.appendChild(tooltip);

				const wrapper1 = document.createElement('div');
				!!wrapper1 && (wrapper1.id = popupId);
				!!wrapper1 && wrapper1.setAttribute('data-testid', popupId);
				!!wrapper1 && wrapper1.classList.add('md-panel-outer-wrapper', 'md-primoExplore-theme', 'md-panel-is-showing');
				!!wrapper1 && (wrapper1.style.pointerEvents = 'none');
				!!wrapper1 && (wrapper1.style.zIndex = '100');
				!!wrapper2 && !!wrapper1 && wrapper1.appendChild(wrapper2);

				const body = document.querySelector('body');
				!!body && body.appendChild(wrapper1);

				// set it to auto hide after 5 seconds (not closing seems to be possible - if user moves their mouse too fast? observed on built in buttons too)
				setTimeout(() => {
					removeHelpDialog(popupId);
				}, 5000);
			}

			function removeHelpDialog(popupId) {
				const helpPopup = document.getElementById(popupId);
				!!helpPopup && helpPopup.remove();
			}
		},
		// id = buttonId value. Can we insert the variable here?
		template: '<a id="utility-bar-primo-guide" data-testid="utility-bar-primo-guide" href="https://guides.library.uq.edu.au/how-to-find/using-library-search" target="_blank" aria-labelledby="helpLinklabel">' +
					'<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24">' +
						'<g transform="translate(3, 3) scale(0.7)">' +
							'<path ' +
								' d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44.91-1.29.4-3.7-2.18-3.7-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41.7 1.15 1.11 3.3.03 4.9-1.2 1.77-2.35 2.31-2.97 3.45-.25.46-.35.76-.35 2.24h-2.89c-.01-.78-.13-2.05.48-3.15M14 20c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2"' +
							'>' +
							'</path>' +
						'</g>' +
					'</svg>' +
					'<span id="helpLinklabel" class="utility-button-labels help-button-label">Help</span>' +
				'</a>',
	});

	function isDomainProd() {
		return window.location.hostname === "search.library.uq.edu.au";
	}

	// based on https://knowledge.exlibrisgroup.com/Primo/Community_Knowledge/How_to_create_a_%E2%80%98Report_a_Problem%E2%80%99_button_below_the_ViewIt_iframe
	app.component("prmFullViewServiceContainerAfter", {
		bindings: { parentCtrl: "<" },
		controller: function ($scope) {
			var vm = this;
			this.$onInit = function () {
				vm.targeturl = "";

				var recordId = "";
				// no one knows what the TN actually means (per SVG), but in practice all the CDI records have it on their record id
				if (
					!!vm.parentCtrl?.item?.pnx?.control?.recordid &&
					vm.parentCtrl.item.pnx.control.recordid[0] &&
					vm.parentCtrl.item.pnx.control.recordid[0].startsWith("TN")
				) {
					recordId = encodeURIComponent(vm.parentCtrl.item.pnx.control.recordid);
				}
				if (recordId === "") {
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
				const maxLengthEncodedChar = "%E2%82%AC";
				[...Array(maxLengthEncodedChar.length)].map((_, i) => {
					try {
						decodeURIComponent(recordTitle);
					} catch {
						recordTitle = recordTitle.slice(0, -1);
					}
				});

				var isIE11 = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1;

				// if we are not IE11 and can get a docid and a title - add a button
				if (!isIE11 && recordId !== "" && recordTitle !== "") {
					var crmDomain = "https://uqcurrent--tst1.custhelp.com"; // we can probably return the live url for all when this is in prod
					if (isDomainProd()) {
						crmDomain = "https://support.my.uq.edu.au";
					}

					vm.targeturl =
						crmDomain +
						"/app/library/contact/report_problem/true/incidents.subject/" +
						recordTitle +
						"/incidents.c$summary/" +
						recordId;
				}
			};
		},
		template:
			'<div ng-if="$ctrl.targeturl"><getit-link-service>' +
			'<a ng-href="{{$ctrl.targeturl}}" target="_blank" class="md-button md-primary report-a-problem">' +
			'<span>Report a Problem</span>' +
			'</a>' +
			"</getit-link-service></div>",
	});

	/****************************************************************************************************/

	/*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

	/*var app = angular.module('centralCustom', ['angularLoad']);*/

	/****************************************************************************************************/

	// There are 3 places we add the custom indicators:
	// - on lists of search results
	// - on specific records
	// - and... some records have an entry like "2 versions of this item See all versions"
	//    on them and when its clicked, it opens up a list view that has an extra record at the top
	//    At the top of this list view is the third place we put the custom indicator
	// See canary tests for examples
	function createCustomIconIndicator(svgPathValue, iconWrapperClassName, labelText, uniqueId) {

		const iconClassName = `${iconWrapperClassName}Icon`;
		const labelClassName = `${iconWrapperClassName}Label`;
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		!!path && path.setAttribute("d", svgPathValue);

		const svgCR = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		!!svgCR && svgCR.setAttribute("width", "100%");
		!!svgCR && svgCR.setAttribute("height", "100%");
		!!svgCR && svgCR.setAttribute("viewBox", "0 0 24 24");
		!!svgCR && svgCR.setAttribute("focusable", "false");
		!!svgCR && !!path && svgCR.appendChild(path);

		const mdIcon = document.createElement("md-icon");
		!!mdIcon && mdIcon.setAttribute("role", "presentation");
		!!mdIcon && (mdIcon.className = "md-primoExplore-theme");
		!!mdIcon && !!svgCR && mdIcon.appendChild(svgCR);

		const prmIcon = document.createElement("prm-icon");
		!!prmIcon && prmIcon.classList.add(iconClassName, 'indicatorIcon', 'badge-icon');
		!!prmIcon && !!mdIcon && prmIcon.appendChild(mdIcon);

		const contentLabel = document.createElement("span");
		!!contentLabel && contentLabel.classList.add(labelClassName, "customIndicatorLabel");
		!!contentLabel && (contentLabel.innerHTML = labelText);

		const iconWrapper = document.createElement("div");
		// iconWrapperClassName is used to hide any duplicate icons, which shouldn't happen, but rarely there is a race condition
		!!iconWrapper && iconWrapper.classList.add('customIndicator', 'badge-item', iconWrapperClassName, 'layout-row');
		!!iconWrapper && !!prmIcon && iconWrapper.appendChild(prmIcon);
		!!iconWrapper && !!contentLabel && iconWrapper.appendChild(contentLabel);

		return iconWrapper;
	}

	function addCustomIconIndicatorToHeader(createdIndicator, intendedParentElement = null) {
		// when there are no Content Indicators (ie neither Open Access (OA) nor Peer-reviewed (PR)) then we must build the wrapping elements
		let wrapper1 = intendedParentElement.querySelector('div.badges.layout-align-start-start.layout-column');
		if (!wrapper1) {
			const newDiv1 = document.createElement('div');
			!!newDiv1 && newDiv1.classList.add('badges', 'layout-align-start-start', 'layout-column');
			intendedParentElement.appendChild(newDiv1);
		}
		wrapper1 = intendedParentElement.querySelector('div.badges.layout-align-start-start.layout-column');

		let wrapper2 = !!wrapper1 && wrapper1.querySelector('div.badges.layout-align-start-start.layout-column > div');
		if (!wrapper2) {
			const newDiv2 = document.createElement('div');
			!!newDiv2 && newDiv2.classList.add('layout-row');
			!!wrapper1 && wrapper1.appendChild(newDiv2);
		}
		wrapper2 = !!wrapper1 && wrapper1.querySelector('div.badges.layout-align-start-start.layout-column > div');

		!!wrapper2 && wrapper2.appendChild(createdIndicator);

		// attach the indicator just before the "after" element, to make all Indicators appear on the same line
		const sibling = intendedParentElement.querySelector('prm-search-result-journal-indication-line-after');
		!!wrapper1 && !!sibling && intendedParentElement.insertBefore(wrapper1, sibling);
	}

	function getSelectorParent(recordId, pageType = null, recursionCount = 0) {
		const selectorRoot = "SEARCH_RESULT_RECORDID_";
		let parentDOMId = `${selectorRoot}${recordId}_FULL_VIEW`;
		const domCheckFull = document.getElementById(parentDOMId);
		const specificClassName = pageType === 'specificversion' ? '.list-item-wrapper' : pageType === 'brief' ? '.list-item' : '';
		if (!domCheckFull) {
			parentDOMId = `${selectorRoot}${recordId}`;
			const domCheck = document.getElementById(parentDOMId);
			if (!domCheck && recursionCount < 10) {
				// there are times when the page seems to be a full display, but we are on a brief results page.
				// does the code load too fast and the url hasn't changed yet?
				setTimeout(() => getSelectorParent(recordId, pageType, recursionCount + 1), 100);
			}
		}
		return `prm-brief-result-container${specificClassName} #${parentDOMId}`;
	}

	function addCulturalAdviceIndicatorToHeader(recordId, uniqueIdSuffix, pageType='full', intendedParentElement) {
		const className = "culturalAdviceMark";
		const thisIndicatorAbbrev = "cultadv";
		const muiIconInfoSvgPath =
			"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z";
		const labelText = "CULTURAL ADVICE";

		const selectorParent = getSelectorParent(recordId, pageType);
		const uniqueId = `${selectorParent}-${thisIndicatorAbbrev}-${uniqueIdSuffix}`;

		const createdIndicator = createCustomIconIndicator(muiIconInfoSvgPath, className, labelText, uniqueId);
		if (!createdIndicator) {
			return;
		}

		addCustomIconIndicatorToHeader(createdIndicator, intendedParentElement);
	}

	function addCourseResourceIndicatorToHeader(recordId, uniqueIdSuffix, pageType='full', intendedParentElement) {
		const className = "readingListMark";
		const thisIndicatorAbbrev = "courseres";
		const muiIconAccountBalanceSvgPath = "M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zm-5-9L2 6v2h20V6z";
		const labelText = "COURSE READING LIST";

		const selectorParent = getSelectorParent(recordId, pageType);
		const uniqueId = `${selectorParent}-${thisIndicatorAbbrev}-${uniqueIdSuffix}`;

		const createdIndicator = createCustomIconIndicator(muiIconAccountBalanceSvgPath, className, labelText, uniqueId);
		if (!createdIndicator) {
			return;
		}

		addCustomIconIndicatorToHeader(createdIndicator, intendedParentElement);
	}

	function getListTalisUrls(item) {
		const TALIS_DOMAIN = "https://uq.rl.talis.com/";
		const list = [];
		// need to restrict a new type and don't know the exact name? Get an example url for the type and put a debug
		// stop in the browser Source Inspection in getListTalisUrls, and check what is found at
		// Local > item > pnx > type in the variable Scope
		const materialType = !!item?.pnx?.display?.type && item.pnx.display.type[0];
		const restrictedCheckList = [
			"article",
			"book_chapter",
			"conference_paper",
			"conference_proceeding",
			"dataset",
			"design",
			"government_document",
			"magazinearticle", // Primo currently using a non-standard format
			"magazine_article", // future-proof it
			"market_research",
			"newsletterarticle", // Primo currently using a non-standard format
			"newsletter_article", // future-proof it
			"newspaper_article",
			"patent",
			"questionnaire",
			"reference_entry",
			"report",
			"review",
			"web_resource",
			"working_paper",
		];
		const isRestrictedCheckType = restrictedCheckList.includes(materialType);

		// LCN
		if (!!item?.pnx?.search?.addsrcrecordid && item.pnx.search.addsrcrecordid.length > 0) {
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
		if (!isRestrictedCheckType && !!item?.pnx?.addata?.eisbn && item.pnx.addata.eisbn.length > 0) {
			item.pnx.addata.eisbn.forEach(r => {
				const isbn = r.replace(/[^0-9X]+/gi, '');
				[10, 13].includes(isbn.length) && list.push(TALIS_DOMAIN + 'eisbn/' + isbn + '/lists.json');
			})
		}

		// ISBN
		if (!isRestrictedCheckType && !!item?.pnx?.addata?.isbn && item.pnx.addata.isbn.length > 0) {
			item.pnx.addata.isbn.forEach(r => {
				const isbn = r.replace(/[^0-9X]+/gi, '');
				[10, 13].includes(isbn.length) && list.push(TALIS_DOMAIN + 'isbn/' + isbn + '/lists.json');
			})
		}

		// EISSN
		if (!isRestrictedCheckType && !!item?.pnx?.addata?.eissn && item.pnx.addata.eissn.length > 0) {
			item.pnx.addata.eissn.forEach(r => {
				list.push(TALIS_DOMAIN + 'eissn/' + r + '/lists.json');
			})
		}

		// ISSN
		if (!isRestrictedCheckType && !!item?.pnx?.addata?.issn && item.pnx.addata.issn.length > 0) {
			item.pnx.addata.issn.forEach(r => {
				list.push(TALIS_DOMAIN + 'issn/' + r + '/lists.json');
			})
		}

		return list;
	}

	function isFullDisplayPage() {
		return window.location.pathname.includes("fulldisplay");
	}

	function addCulturalAdviceBanner(displayText) {
		// eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain images transcripts or names of Aboriginal and Torres Strait Islander people now deceased.  It may also contain historically and culturally sensitive words, terms, and descriptions."
		const displayBlockClassName = "culturalAdviceBanner";
		const displayBlock = document.querySelector(`.${displayBlockClassName}`);
		if (!!displayBlock) {
			// block already exists - don't duplicate
			return;
		}

		const para = document.createElement("p");
		!!para && (para.innerHTML = displayText);

		const block = document.createElement("div");
		!!block && (block.className = displayBlockClassName);
		!!para && !!para && block.appendChild(para);

		const waitforWrapperToExist = setInterval(() => {
			const siblingClass = ".search-result-availability-line-wrapper";
			const siblings = document.querySelectorAll(siblingClass);
			if (!!siblings) {
				clearInterval(waitforWrapperToExist);
				siblings.forEach(appendToSibling => appendToSibling.insertAdjacentElement('afterend', block));
			}
		}, 100);

	}

	const unavailableStatusClass = 'uql-availability-status-unavailable';
	function highlightUnavailableResources(availabilityElement) {
		const textContent = availabilityElement.textContent;
		if ((textContent.includes("Check availability") || textContent.includes("Access conditions apply")) &&
			!availabilityElement.classList.contains(unavailableStatusClass)
		) {
			availabilityElement.classList.add(unavailableStatusClass);
			return true;
		}
		return false;
	}

	function styleAvailabilityStatementOnFullRecords() {
		const waitForAvailability = setInterval(() => {
			const availabilityElement = document.querySelector(`prm-full-view-service-container prm-search-result-availability-line .availability-status:not(.${unavailableStatusClass})`);
			if (!availabilityElement) {
				return;
			}
			const updated = highlightUnavailableResources(availabilityElement);

			// there can be multiple availability lines, although only one will be need this unavailable status, so we cant always clear yet
			if (!!updated || availabilityElement.textContent.startsWith("Available at")) {
				clearInterval(waitForAvailability);
			}
		}, 100);
	}

	// in rare instances prm-service-details-after fires twice. When it does, we get 2 CRL. Block this.
	let CRLSectionAlreadyAdded = false;

	function addCRLButtontoSidebar() {
		// show the label in two spans so we can make it look wrapped
		const label1 = document.createTextNode('Course Reading');
		const span1 = document.createElement('span');
		!!label1 && !!span1 && span1.appendChild(label1);
		const label2 = document.createTextNode('Lists');
		const span2 = document.createElement('span');
		!!span2 && (span2.style.display = 'block');
		!!span2 && (span2.style.marginTop = '-16px');
		!!label2 && !!span2 && span2.appendChild(label2);

		const crlSidebarButton = document.createElement('button');
		!!crlSidebarButton && crlSidebarButton.classList.add('zero-margin', 'button-right-align', 'button-link', 'md-button', 'md-primoExplore-theme', 'md-ink-ripple', 'sidebar-crl-label');
		!!crlSidebarButton && (crlSidebarButton.type = 'button');
		!!crlSidebarButton && (crlSidebarButton.ariaLabel = "Course Reading Lists");
		!!span1 && !!crlSidebarButton && crlSidebarButton.appendChild(span1);
		!!span2 && !!crlSidebarButton && crlSidebarButton.appendChild(span2);
		!!crlSidebarButton && (crlSidebarButton.onclick = function () {
			scrollToSection('#full-view-section-courseReadingLists');
		});

		// add our new button immediately after the details button so it is in the same order as the main panel
		const detailsButton = document.querySelector('button:has([translate="brief.results.tabs.details"])');
		detailsButton.insertAdjacentElement('afterend', crlSidebarButton);
	}

	function createAndAppendCourseList(talisCourses) {
		if (!!CRLSectionAlreadyAdded) { // place the check this late to prevent race conditions
			return;
		}
		CRLSectionAlreadyAdded = true;

		const targetElement = document.querySelector('div#details');

		let htmlContent = '' +
			'<div class="full-view-section-content">' +
			'<prm-full-view-service-container>' +
			'<div class="section-head">' +
			'<prm-service-header>' +
			'<div layout="row" layout-align="center center" class="layout-align-center-center layout-row">' +
			'<h4 class="section-title md-title light-text">Course reading lists</h4>' +
			'<md-divider flex="" class="md-primoExplore-theme flex"></md-divider>' +
			'</div>' +
			'<prm-service-header-after parent-ctrl="$ctrl"></prm-service-header-after>' +
			'</prm-service-header>' +
			'</div>' +
			'<div class="section-body">' +
			'<div>' +
			'<prm-service-details>' +
			'<ul class="course-resource-list">';
		for (const [url, displayName] of Object.entries(talisCourses)) {
			htmlContent += '<li>' +
				`<a class="button-as-link link-alt-color md-button md-primoExplore-theme md-ink-ripple" href="${url}" target="_blank">` +
				`<span>${displayName}</span>` +
				'<prm-icon external-link="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new">' +
				'<md-icon md-svg-icon="primo-ui:open-in-new" role="presentation" class="md-primoExplore-theme">' +
				'<svg width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">' +
				'<path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>' +
				'</svg>' +
				'</md-icon>' +
				'</prm-icon>' +
				'</a>' +
				'</li>';
		}
		htmlContent += '' +
			"</ul>" +
			'</prm-service-details>' +
			'</div>' +
			'</div>' +
			'</prm-full-view-service-container>' +
			'</div>';

		// Create a temporary container to attach the HTML
		const tempContainer = document.createElement('div');
		!!tempContainer && tempContainer.classList.add('full-view-section', 'readingListCitations');
		!!tempContainer && (tempContainer.id = "full-view-section-courseReadingLists");
		!!tempContainer && (tempContainer.tabindex = "-1");
		tempContainer.innerHTML = htmlContent;

		// Insert the course list as the first child of the target element
		targetElement.insertAdjacentElement("afterend", tempContainer);
	}

	function displayCulturalAdviceIndicatorOnSomeFullRecords(vm) {
		const recordId = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
		const culturalAdviceDisplayRequired = !!vm?.parentCtrl?.item?.pnx?.display?.lds05; // eg "Cultural advice - Aboriginal and Torres Strait Islander peoples"
		if (!!culturalAdviceDisplayRequired && !!recordId) {
			const waitForJIElement = setInterval(() => {
				const journalIndicationElement = document.querySelector('.full-view-container prm-search-result-journal-indication-line');
				if (!journalIndicationElement) {
					return;
				}
				clearInterval(waitForJIElement);
				addCulturalAdviceIndicatorToHeader(recordId, "full", null, journalIndicationElement);
			}, 100);
		}
	}

	function displayCulturalAdviceBannerOnSomeFullRecords(vm) {
		const recordId = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
		const culturalAdviceDisplayRequired = !!vm?.parentCtrl?.item?.pnx?.display?.lds05; // eg "Cultural advice - Aboriginal and Torres Strait Islander peoples"
		if (!!culturalAdviceDisplayRequired && !!recordId) {
			const culturalAdviceBody = !!vm?.parentCtrl?.item?.pnx?.display?.lds04 && vm.parentCtrl.item.pnx.display?.lds04; // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain ..."
			!!culturalAdviceBody && culturalAdviceBody.length > 0 && !!culturalAdviceBody[0] && addCulturalAdviceBanner(culturalAdviceBody[0]);
		}
	}

	function displayReadingListIndicatorOnSomeFullRecords($http, vm) {
		const unsafeReadingListBaseUrl = 'http://lr.library.uq.edu.au';
		const safeReadingListBaseUrl = 'https://uq.rl.talis.com';

		const talisCourses  = {};
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
					});
				})
				.finally(() => {
					if (Object.keys(courseList).length > 0) {
						const recordid = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
						if (!!recordid) {
							const waitForJIElement = setInterval(() => {
								const journalIndicationElement = document.querySelector('.full-view-container prm-search-result-journal-indication-line');
								if (!journalIndicationElement) {
									return;
								}
								clearInterval(waitForJIElement);
								addCourseResourceIndicatorToHeader(recordid, "full", null, journalIndicationElement);
							}, 100);
						}

						// sort by course code for display
						let sortable = [];
						for (let talisUrl in courseList) {
							const subjectCode = courseList[talisUrl];
							sortable.push([talisUrl, subjectCode]);
						}
						sortable.sort(function (a, b) {
							return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
						});
						sortable.forEach((entry) => {
							const subjectCode = entry[1];
							const talisUrl = fixUnsafeReadingListUrl(addUrlParam(entry[0], 'login', true));
							talisCourses[talisUrl] = subjectCode;
						});

						createAndAppendCourseList(talisCourses);

						addCRLButtontoSidebar();
					}
				});
		}

		function fixUnsafeReadingListUrl(url) {
			return url.replace(unsafeReadingListBaseUrl, safeReadingListBaseUrl);
		}

		function addUrlParam(url, name, value) {
			const param = value !== undefined ? `${name}=${value}` : name;
			const separator = url.includes('?') ? '&' : '?';
			return `${url}${separator}${param}`;
		}

		const listTalisUrls = vm?.parentCtrl?.item && getListTalisUrls(vm.parentCtrl.item);
		if (!!listTalisUrls && listTalisUrls.length > 0) {
			getTalisDataFromAllApiCalls(listTalisUrls);
		}
	}

	app.component("prmServiceDetailsAfter", { // prm-service-details-after
		// loosely based on https://support.talis.com/hc/en-us/articles/115002712709-Primo-Explore-Integrations-with-Talis-Aspire
		// and https://github.com/alfi1/primo-aspire-api/blob/master/getAspireLists_Angular1-6.js
		// check for a reading list in the full results page and add an indicator and list if so
		bindings: { parentCtrl: "<" },
		controller: function ($scope, $http) {
			const vm = this;

			this.$onInit = function () {
				if (!isFullDisplayPage()) {
					return;
				}

				// Adjust FULL results display here

				styleAvailabilityStatementOnFullRecords();

				displayReadingListIndicatorOnSomeFullRecords($http, vm);

				displayCulturalAdviceIndicatorOnSomeFullRecords(vm);

				displayCulturalAdviceBannerOnSomeFullRecords(vm);
			};
		},
		template: '',
	});

	function displayCulturalAdviceIndicatorOnSomeBriefRecords(parentCtrl, vm) {
		const sectionWrapper = parentCtrl.$element[0];

		const waitForJIElement = setInterval(() => {
			const journalIndicationElement = sectionWrapper.querySelector('prm-search-result-journal-indication-line');
			if (!journalIndicationElement) {
				return;
			}
			clearInterval(waitForJIElement);

			const isSelectedVersion = sectionWrapper.classList.contains('list-item-wrapper');
			const pageType = isSelectedVersion ? 'specificversion' : 'brief';
			const recordId = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
			const recordCount = !!vm?.parentCtrl?.resultUtil?._updatedBulkSize ? vm.parentCtrl.resultUtil._updatedBulkSize : false; // eg 61UQ_ALMA51124881340003131
			const culturalAdviceDisplayRequired = !!vm?.parentCtrl?.item?.pnx?.display?.lds05; // eg "Cultural advice - Aboriginal and Torres Strait Islander peoples"
			if (!!culturalAdviceDisplayRequired && !!recordId) {
				addCulturalAdviceIndicatorToHeader(recordId, `brief-${recordCount}`, pageType, journalIndicationElement);
			}
		}, 100);
	}

	function displayReadingListIndicatorOnSomeBriefRecords($http, $scope, vm) {
		function getTalisDataFromFirstSuccessfulApiCall(listUrlsToCall) {
			const url = listTalisUrls.shift();
			url.startsWith("http") && $http.jsonp(url, {jsonpCallbackParam: "cb"})
				.then(function handleSuccess(response) {
					$scope.listsFound = response.data || null;
					if (!$scope.listsFound && listUrlsToCall.length > 0) {
						getTalisDataFromFirstSuccessfulApiCall(listUrlsToCall);
					}
					if (!!$scope.listsFound) {
						const recordid = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // 61UQ_ALMA51124881340003131
						if (!!recordid) {
							const parentCtrl = $scope.$ctrl.parentCtrl;
							const sectionWrapper = parentCtrl.$element[0];

							const waitForJIElement = setInterval(() => {
								const journalIndicationElement = sectionWrapper.querySelector('prm-search-result-journal-indication-line');
								if (!journalIndicationElement) {
									return;
								}
								clearInterval(waitForJIElement);

								const isSelectedVersion = sectionWrapper.classList.contains('list-item-wrapper');
								const pageType = isSelectedVersion ? 'specificversion' : 'brief';
								addCourseResourceIndicatorToHeader(recordid, "brief", pageType, journalIndicationElement);
							}, 100);
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
	}

	function styleAvailabilityStatementOnBriefRecord(parentCtrl) {
		// style the availability statement to spec (grey when unavailable)
		const availabilityLoad = setInterval(() => {
			const sectionWrapper = parentCtrl.$element[0];
			const availabilityElement = !!sectionWrapper && sectionWrapper.querySelector('.search-result-availability-line-wrapper span.availability-status');
			if (!availabilityElement) {
				return;
			}

			clearInterval(availabilityLoad);
			!!availabilityElement && highlightUnavailableResources(availabilityElement);
		}, 100);
	}

	function isDirectLinkingAllowed(vm) {
		const directLinkingTypes = [
			"journals", "newspapers", "magazines",
			"journal", "newspaper", "magazine",
		];
		const resourceType =
			!!vm?.parentCtrl?.item?.pnx?.display?.type && vm.parentCtrl.item.pnx.display.type.length > 0
				? vm.parentCtrl.item.pnx.display.type[0]
				: "";
		return !directLinkingTypes.includes(resourceType);
	}

	function overrideDirectLinkingOnSomeBriefRecords(sectionWrapper, vm) {
		// for some types, the availabnility link loads the resource directly when we want them to go to the full view
		// we cant override the click on the extant element
		// so delete it and insert static text that will pick up the overall parent click to the full record
		const maxCount = 50;
		let loopCount = 0;
		const awaitWrapper = setInterval(() => {
			loopCount++;
			const button = sectionWrapper.querySelector('.result-item-text .search-result-availability-line-wrapper prm-search-result-availability-line button');
			if ((!button || button.length === 0) && loopCount < maxCount) {
				return;
			}
			clearInterval(awaitWrapper);

			const oldAvailabilityWrapper = sectionWrapper.querySelector('.result-item-text .search-result-availability-line-wrapper prm-search-result-availability-line');

			// putting this check here (rather than outside the Interval) allows time for the pnx to be available
			if (!!isDirectLinkingAllowed(vm)) {
				return;
			}

			// we reuse prm-snippet because it is the only one that doesn't cause this weird thing where the z-index interferes with the hover on the new link
			const newAvailabilityWrapper = document.createElement("prm-snippet");
			!!newAvailabilityWrapper && newAvailabilityWrapper.classList.add('arrow-link-button', 'availability-button');

			// supply the contents of the old to this new element
			!!newAvailabilityWrapper && Array.from(oldAvailabilityWrapper.children)
				.forEach(sectionChild => {
					// there may be multiple buttons - provide a separate line for each
					const buttonParent = sectionChild.querySelector('div');

					const wrappingDiv = document.createElement('div');
					!!wrappingDiv && newAvailabilityWrapper.appendChild(wrappingDiv);
					!!buttonParent && Array.from(buttonParent.children)
						.forEach(async child => {
							if (child.tagName === 'BUTTON') {
								// if it's a button, it may link out. replace with a span
								const button = child;
								const newChild = document.createElement('span');
								newChild.className = button.className;

								const nodes = Array.from(button.childNodes);
								// Wait for all spans inside any span to have text content - look at OTB, there is a delay while the second span loads so we have to wait
								await Promise.all(nodes.map(node => {
									return new Promise(resolve => {
										if (node.tagName === 'SPAN') {
											const innerSpans = Array.from(node.querySelectorAll('span'));

											if (innerSpans.length > 0) {
												Promise.all(innerSpans.map(innerSpan => {
													return new Promise(innerResolve => {
														const checkContent = () => {
															if (innerSpan.textContent.trim() !== '') {
																innerResolve();
															} else {
																setTimeout(checkContent, 50);
															}
														};
														checkContent();
													});
												})).then(resolve);
											} else {
												resolve();
											}
										} else {
											resolve();
										}
									});
								}));

								nodes.forEach(node => {
									newChild.appendChild(node.cloneNode(true));
								});

								!!newChild && wrappingDiv.appendChild(newChild);
							} else {
								wrappingDiv.appendChild(child);
							}
						});
				});

			const availabilityLine = sectionWrapper.querySelector('prm-search-result-availability-line')
			availabilityLine.parentNode.parentNode.appendChild(newAvailabilityWrapper);

			// get rid of the old availability line - its taking up space
			const oldAvailabilityParent = sectionWrapper.querySelector('.search-result-availability-line-wrapper');
			oldAvailabilityParent.remove();
		}, 100);
	}

	function moveCdiAttributesBelowOtherContentIndicators(sectionWrapper) {
		function getSvgIcon(element) {
			const muiIconHighlightOff = '<path d="M14.59 8 12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"></path>';
			const muiIconRemoveCircleOutline = '<path d="M7 11v2h10v-2zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8"></path>';
			const muiIconReview = '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H5.17L4 17.17V4h16z"></path><path d="m12 15 1.57-3.43L17 10l-3.43-1.57L12 5l-1.57 3.43L7 10l3.43 1.57z"></path>';

			const isPreprint = element.querySelector('span[translate="attribute.preprint"]');
			const isPrimarySource = element.querySelector('span[translate="attribute.primary_source"]');
			const isReviewArticle = element.querySelector('span[translate="attribute.review_article"]');

			const isPublicationWithAddendum = element.querySelector('span[translate="attribute.publication_addendum"]');
			const isPublicationExpressionConcern = element.querySelector('span[translate="attribute.publication_exp_concern"]');
			const isPublicationWithCorrigendum = element.querySelector('span[translate="attribute.publication_corrigendum"]');

			const isRetractedPublication = element.querySelector('span[translate="attribute.retracted_publication"]');
			const isRetractionNotice = element.querySelector('span[translate="attribute.retraction_notice"]');
			const isWithdrawnNotice = element.querySelector('span[translate="attribute.withdrawal_notice"]');
			const isWithdrawnPublication = element.querySelector('span[translate="attribute.withdrawn_publication"]');

			let childSvg = null;
			if (isRetractionNotice || isRetractedPublication || isWithdrawnNotice || isWithdrawnPublication) {
				childSvg = '<svg class="retracted" focusable="false" aria-hidden="true" viewBox="0 0 24 24">' + muiIconHighlightOff + '</svg>';
			}
			if (isPublicationWithCorrigendum || isPublicationWithAddendum || isPublicationExpressionConcern) {
				childSvg = '<svg class="changed" focusable="false" aria-hidden="true" viewBox="0 0 24 24">' + muiIconRemoveCircleOutline + '</svg>';
			}
			if (isReviewArticle || isPrimarySource || isPreprint) {
				childSvg = '<svg class="regular" focusable="false" aria-hidden="true" viewBox="0 0 24 24">' + muiIconReview + '</svg>';
			}
			return childSvg;
		}

		function moveBadgeItems(parentRow) {
			const elementsToMove = parentRow.querySelectorAll(
				'.prm-cdi-attributes-warning, .prm-cdi-attributes-regular'
			);
			if (!elementsToMove) {
				return; // Exit if parent not found
			}

			const sibling = parentRow.querySelector('.layout-row:has(>.layout-row)');
			const newRow = document.createElement('div');
			!!newRow && newRow.classList.add('layout-row', 'layout-row-followup');
			elementsToMove.forEach(element => {
				const childSvg = getSvgIcon(element);
				if (!!childSvg) {
					const svgTemplate = document.createElement('template');
					svgTemplate.innerHTML = childSvg.trim();
					element.insertBefore(svgTemplate.content.firstChild, element.firstChild);
				}
				newRow.appendChild(element);
			});

			!!sibling && !!newRow && sibling.insertAdjacentElement('afterend', newRow);
		}

		const maxLoop = 20;
		let loopCounter = 0;
		const awaitIndicators = setInterval(() => {
			loopCounter++;
			if (loopCounter > maxLoop) {
				clearInterval(awaitIndicators);
			}

			const hasLayoutChildren = sectionWrapper.querySelector('.layout-row:has(.layout-row)');
			if (!hasLayoutChildren) {
				return;
			}
			clearInterval(awaitIndicators);

			!!sectionWrapper && moveBadgeItems(sectionWrapper);
		}, 100);
	}

	function scrollToSection(sectionSelectors) {
		const headerSelectors = sectionSelectors + ' h4';

		const sectionHeader = document.querySelector(headerSelectors);
		sectionHeader.scrollIntoView({behavior: 'smooth'});

		// put big left bracket style on section
		const landingSection = document.querySelector(sectionSelectors);
		!!landingSection && landingSection.classList.add('section-focused');

		// let the big bracket fade out after one second
		setTimeout(() => {
			!!landingSection && landingSection.classList.contains('section-focused') && landingSection.classList.remove('section-focused');
		}, 1000);
	}

	function overrideDirectLinkingOnSomeFullRecords(vm, sectionWrapper, $scope) {
		const maxCount = 50;
		let loopCount = 0;
		const awaitWrapper = setInterval(() => {
			loopCount++;
			const oldButtons = sectionWrapper.querySelectorAll('.result-item-text .search-result-availability-line-wrapper prm-search-result-availability-line button');
			if (!oldButtons && loopCount < maxCount) {
				return;
			}
			clearInterval(awaitWrapper);

			// putting this check here (rather than outside the Interval) allows time for the pnx to be available
			if (!!isDirectLinkingAllowed(vm)) {
				return;
			}

			Array.from(oldButtons)
				.forEach(oldButton => {
					const newButton = document.createElement('button');
					!!newButton && newButton.classList.add('neutralized-button', 'arrow-link-button', 'md-button', 'md-primoExplore-theme', 'md-ink-ripple', 'without-direct-linking');
					newButton.addEventListener('click', function (event) {
						event.preventDefault();
						scrollToSection('#getit_link1_0.full-view-section');
						return false;
					});

					!!newButton && Array.from(oldButton.children)
						.forEach(child => {
							child.tagName !== 'PRM-ICON' && newButton.appendChild(child);
						});
					oldButton.parentNode.appendChild(newButton);
				});

			oldButton.remove();
		}, 100);
	}

	app.component("prmBriefResultContainerAfter", { // prm-brief-result-container-after
		// brief result in list may have additional icons and styled availability
		bindings: { parentCtrl: "<" },
		controller: function ($scope, $http) {
			var vm = this;

			this.$onInit = function () {
				$scope.listsFound = null;

				const parentCtrl = $scope.$ctrl.parentCtrl;
				const sectionWrapper = parentCtrl.$element[0];

				moveCdiAttributesBelowOtherContentIndicators(sectionWrapper); // both full and brief

				if (!!isFullDisplayPage()) {
					overrideDirectLinkingOnSomeFullRecords(vm, sectionWrapper, $scope);

					return;  // only handle brief records after this point
				}

				displayReadingListIndicatorOnSomeBriefRecords($http, $scope, vm);

				displayCulturalAdviceIndicatorOnSomeBriefRecords(parentCtrl, vm);

				styleAvailabilityStatementOnBriefRecord(parentCtrl);

				// redirect the `available online` click on certain records to open the full record
				overrideDirectLinkingOnSomeBriefRecords(sectionWrapper, vm);
			};
		},
		template: "",
	});

	app.component('prmFacetExactAfter', {
		bindings: { parentCtrl: "<" },
		controller: function ($scope, $http) {
			const vm = this;
			this.$onInit = function () {
				function extractRecordCount(parentElement, label) {
					const ariaLabel = !!parentElement && parentElement.getAttribute('aria-label');
					return !!ariaLabel && ariaLabel.replace(label, '')
						.replace(/[^\d,]/g, '')
						.trim();
				}

				function createCountTextNode(recordCount, elementId) {
					const internalSpan = document.createElement('span');
					!!internalSpan && internalSpan.classList.add('text-in-brackets', 'facet-counter', 'manual-count');
					!!internalSpan && (internalSpan.id = elementId);
					const textNode = !!recordCount && document.createTextNode(recordCount);
					!!internalSpan && !!textNode && internalSpan.appendChild(textNode);

					const wrapperSpan = document.createElement('span');
					!!wrapperSpan && wrapperSpan.classList.add('facet-title', 'layout-align-end-stretch', 'layout-row', 'manual-count-wrapper');
					!!wrapperSpan && !!internalSpan && wrapperSpan.appendChild(internalSpan);
					return wrapperSpan;
				}

				function getNewItemId(element) {
					let newId = element?.textContent?.toLowerCase().replace(/[^a-zA-Z]/g, '');
					newId += 'Count';
					return newId;
				}

				function addCountToFacetEntries(facetLabel) {
					const awaitFacetGroup = setInterval(() => {
						// wait for this facet section to load
						const facetGroup = document.querySelectorAll(`prm-facet-group:has([title="${facetLabel}"]) .text-number-space`);
						if (!facetGroup) {
							return; // sidebar not available yet
						}
						// get any that don't yet have our manual-count class
						const elementList = document.querySelectorAll(`prm-facet-group:has([title="${facetLabel}"]) div:has(> strong):not(:has(.manual-count))`);
						if (!!elementList && elementList.length > 0) {
							clearInterval(awaitFacetGroup);

							elementList.forEach((wrappingParent) => {
								const checkById = `prm-facet-group:has([title="${facetLabel}"]) ` + getNewItemId(wrappingParent);
								const checkByIdElement = document.querySelector(checkById);
								const existingCountCheck = wrappingParent?.parentNode?.querySelector('.text-in-brackets');
								if (!checkByIdElement && // our code hasn't been run before for this item
									!existingCountCheck // primo haven't started supplying the number
								) {
									// extract the record count from the element's aria label
									const element = wrappingParent.querySelector('.text-number-space');
									const recordCount = !!element?.parentNode && !!element?.textContent && extractRecordCount(element?.parentNode, element.textContent);
									const numericRecordCount = parseInt(recordCount.replace(',', ''), 10);
									// create a display element to put on the screen
									const newDisplayElement = !!recordCount && numericRecordCount > 0 && createCountTextNode(recordCount, getNewItemId(element));
									// attach the new display element to the parent
									!!newDisplayElement && (wrappingParent.appendChild(newDisplayElement));
								}
							});
						}
					}, 100);
				}

				['Show only', 'New records'].map(facetLabel => {
					addCountToFacetEntries(facetLabel);
				})
			}
		},
		template: '',
	});

	app.component('prmAdvancedSearchAfter', {
		bindings: { parentCtrl: "<" },
		controller: function ($scope, $http) {
			function clearLanguageOption(languageLabel) {
				const languageWrapper = !!languageLabel && languageLabel.parentNode;
				!!languageWrapper && languageWrapper.remove();
			}

			const awaitMenuOption = setInterval(() => {
				const languageLabel = document.querySelector('prm-advanced-search #advancedSearchLanguage');
				if (!!languageLabel) {
					clearInterval(awaitMenuOption);
					clearLanguageOption(languageLabel);
				}
			}, 100);
		},
		template: '',
	});

	// prm-quick-link-after
	// app.component("prmQuickLinkAfter", {
	// 	controller: function ($scope) {
	// 		const theLinkBlock = document.querySelector('prm-quick-link span[translate="fulldisplay.unpaywall.noLinks"]');
	// 		const theContent = !!theLinkBlock && theLinkBlock.innerText;
	// 		if (theContent === 'No links are available for this record') {
	// 			// delete the "Link" button from the sidebar
	// 			const sidebarButtonLabel = document.querySelector('span[translate="nui.brief.results.tabs.links"]');
	// 			const sidebarButton = !!sidebarButtonLabel && sidebarButtonLabel.parentNode;
	// 			!!sidebarButton && sidebarButton.remove();

	// 			// delete the section with the found text
	// 			let theParent = theLinkBlock.parentNode;
	// 			while (theParent) {
	// 				if (theParent.classList && theParent.classList.contains('full-view-section-content')) {
	// 					break;
	// 				}
	// 				theParent = theParent.parentNode;
	// 			}
	// 			theParent.remove();
	// 		}
	// 	}
	// });

	// prm-alma-viewit-items
	app.component("prmAlmaViewitItemsAfter", {
		controller: function ($scope) {
			function addPrefixToLinks(listViewItEntries) {
				!!listViewItEntries &&
				listViewItEntries.length > 0 &&
				listViewItEntries.forEach((element) =>
				{
					if (!element?.parentNode?.textContent.includes('View online') &&
						!element?.parentNode?.textContent.startsWith('View') &&
						!element?.parentNode?.textContent.startsWith('UQ eSpace') &&
						!element?.parentNode?.textContent.startsWith('Information ')
					) {
						const labelText = document.createTextNode(`View online: `);
						const labelTextBlock = document.createElement('span');
						!!labelTextBlock && labelTextBlock.classList.add('internalTitle');
						!!labelTextBlock && !!labelText && labelTextBlock.appendChild(labelText);
						!!element && !!labelTextBlock && element.parentNode.insertBefore(labelTextBlock, element);
					}
				})
			}

			// add "View online" to selected items
			const awaitViewItEntries = setInterval(() => {
				const listViewItParent = document.querySelector('prm-full-view prm-full-view-service-container prm-alma-viewit prm-alma-viewit-items:first-of-type');
				const listViewItEntries = !!listViewItParent && listViewItParent.querySelectorAll('.item-title.md-primoExplore-theme');
				if (!listViewItEntries || listViewItEntries.length === 0) {
					return;
				}
				clearInterval(awaitViewItEntries);

				addPrefixToLinks(listViewItEntries);

				const listViewItAdditionalParent = document.querySelector('prm-full-view prm-full-view-service-container prm-alma-viewit prm-alma-viewit-items:nth-of-type(2)');
				const listViewItAdditionalEntries = !!listViewItAdditionalParent && listViewItAdditionalParent.querySelectorAll('.item-title.md-primoExplore-theme');
				addPrefixToLinks(listViewItAdditionalEntries);

			}, 100);
		}
	});

	const linkOutIconTemplate = () =>
		`<prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new">
    <md-icon md-svg-icon="primo-ui:open-in-new" role="presentation" class="md-primoExplore-theme">
        <svg id="open-in-new_cache36" width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
            <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>
        </svg>
    </md-icon>
</prm-icon>`;

	function createOutLink(linkUrl, linkTitle, stylingId) {
		const label = document.createTextNode(linkTitle);

		const innerStylingSpan = document.createElement('span');
		!!innerStylingSpan && (innerStylingSpan.id = stylingId);
		!!innerStylingSpan && !!label && innerStylingSpan.appendChild(label);

		const link = document.createElement('a');
		if (!link) {
			return;
		}
		link.href = linkUrl;
		link.target = '_blank';
		link.setAttribute('aria-labelledby', stylingId);
		link.classList.add('button-as-link', 'button-external-link', 'inline-button', 'md-button', 'md-primoExplore-theme', 'stackable-link-entry');
		!!innerStylingSpan && link.appendChild(innerStylingSpan);

		link.insertAdjacentHTML('beforeend', linkOutIconTemplate());

		return link;
	}

	// we have custom links that should appear under the heading on most tabs on the Library account page
	function addLinksToAccountArea(tabType, hasLinksAlready, displayLinkList) {
		const wrapperId = `${tabType}s-links`;
		const elementName = tabType === 'personal-info' ? `prm-${tabType}` : `prm-${tabType}s`;
		const elementType = !!hasLinksAlready ? 'div' : 'span';
		const displayAreaSelector = `${elementName} .header-subtitle`;
		const displayArea = document.querySelector(displayAreaSelector);
		if (!displayArea) {
			return;
		}

		const insertionPointCheck = displayArea.querySelector(`#${wrapperId}`);
		if (!!insertionPointCheck) {
			// our links currently exist
			return;
		}

		const insertionPoint = document.createElement(elementType);
		if (!insertionPoint) {
			return;
		}
		insertionPoint.id = wrapperId;
		insertionPoint.classList.add('stackable-links', `stackable-links-${tabType}s`);
		insertionPoint.setAttribute( 'data-testid', `stackable-links-${tabType}s`);
		displayArea.insertBefore(insertionPoint, displayArea.firstChild);

		displayLinkList.map((link, i) => {
			const outLink = createOutLink(link.url, link.title, `${tabType}-${i}`);
			!!outLink && insertionPoint.appendChild(outLink);
		});
	}

	// prm-requests
	app.component("prmRequestsAfter", {
		controller: function ($scope) {
			setInterval(() => {
				// no clearInterval - we have to keep watching to insert it, as primo clears it as the account "tabs" change :(
				const displayLinks = [
					{
						url: 'https://web.library.uq.edu.au/find-and-borrow/request-items',
						title: 'Help for requests',
					}, {
						url: 'https://auth.library.uq.edu.au/login?relais_return=1',
						title: 'Document Delivery Portal',
					}
				];
				addLinksToAccountArea('request', true, displayLinks);
			}, 100);
		}
	});

	// prm-fines
	app.component("prmFinesAfter", {
		controller: function ($scope) {
			setInterval(() => {
				// no clearInterval - we have to keep watching to insert it, as primo clears it as the account "tabs" change :(
				const displayLinks = [
					{
						url: 'https://web.library.uq.edu.au/find-and-borrow/borrow-library/borrowing-rules-and-charges#overdue',
						title: 'About overdue charges',
					}
				];

				addLinksToAccountArea('fine', false, displayLinks);
			}, 100);
		}
	});

	// prm-loans
	app.component("prmLoansAfter", {
		controller: function ($scope) {
			setInterval(() => {
				// no clearInterval - we have to keep watching to insert it, as primo clears it as the account "tabs" change :(
				const displayLinks = [
					{
						url: 'https://web.library.uq.edu.au/find-and-borrow/borrow-library',
						title: 'Help for loans, renewing, recalls, and returns',
					}
				];

				addLinksToAccountArea('loan', false, displayLinks);
			}, 100);
		}
	});

	// prm-messages-and-blocks
	app.component("prmMessagesAndBlocksAfter", {
		controller: function ($scope) {
			setInterval(() => {
				// no clearInterval - we have to keep watching to insert it, as primo clears it as the account "tabs" change :(
				const displayLinks = [
					{
						url: 'https://web.library.uq.edu.au/find-and-borrow/borrow-library/borrowing-rules-and-charges',
						title: 'Borrowing rules',
					}
				];

				addLinksToAccountArea('messages-and-block', false, displayLinks);
			}, 100);
		}
	});

	app.component("prmPersonalInfoAfter", { // prm-personal-info
		controller: function ($scope) {
			setInterval(() => {
				// no clearInterval - we have to keep watching to insert it, as primo clears it as the account "tabs" change :(
				const displayLinks = [
					{
						url: 'https://web.library.uq.edu.au/find-and-borrow/library-memberships',
						title: 'Update your details',
					}, {
						url: 'https://guides.library.uq.edu.au/how-to-find/using-library-search/save-options-and-alerts#s-lg-box-22848997',
						title: 'Information on search history',
					}
				];

				addLinksToAccountArea('personal-info', false, displayLinks);
			}, 100);
		}
	});

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

	// this script should only be called on views that have UQ header showing
	let folder = "/"; // default. Use for prod.
	if (isDomainProd()) {
		if (vidParam === '61UQ_INST:61UQ_APPDEV') {
			folder = "-development/primo-prod-dev/";
		}
	} else if (isDomainPrimoVETest()) { // this `else if` can be removed when Primo VE goes live, because only prod and sandbox will exist
		if (vidParam === '61UQ_INST:61UQ_APPDEV') {
			folder = "-development/primo-prod-dev/";
		} else if (vidParam === '61UQ_INST:61UQ') {
			folder = "-development/primo-veprod/";
		}
	} else { // sandbox domain
		if (vidParam === '61UQ_INST:61UQ_APPDEV') {
			folder = "-development/primo-sandbox-dev/";
		} else if (vidParam === '61UQ_INST:61UQ') {
			folder = "-development/primo-sandbox/";
		}
	}

	// this script should only be called on views that have UQ header showing
	insertScript('https://assets.library.uq.edu.au/reusable-webcomponents' + folder + 'uq-lib-reusable.min.js');
	// we don't yet need this script, but if we do it should be in this location
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
const favouritePinDialogTagName = "prm-favorites-warning-message";
const favouritesPinDialogInitialPositionClassName = "favouritesDialogInitialPosition";
function manageFavouritesPinDialogLocation() {
	setInterval(() => {
		const isFullDisplayPage = window.location.pathname.includes("fulldisplay");
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
			!favouritesDialog.classList.contains(favouritesPinDialogInitialPositionClassName) && favouritesDialog.classList.add(favouritesPinDialogInitialPositionClassName);
		} else {
			// the page has been scrolled and the favourites pin has shifted up to the top of the page - use the built in exlibris dialog position
			!!favouritesDialog.classList.contains(favouritesPinDialogInitialPositionClassName) && favouritesDialog.classList.remove(favouritesPinDialogInitialPositionClassName);
		}
	}, 250);
}

function loadFunctions() {
	manageFavouritesPinDialogLocation();
}

whenPageLoaded(loadFunctions);
