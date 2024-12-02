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

	app.component("prmTopBarBefore", {
		// we found it was more robust to insert the askus button in the different page location via primo angular, see below,
		// so completely skip inserting elements "by attribute"
		template:
			'<uq-gtm gtm="GTM-NC7M38Q"></uq-gtm>' +
			'<uq-header hideLibraryMenuItem="true" searchLabel="library.uq.edu.au" searchURL="http://library.uq.edu.au" skipnavid="searchBar"></uq-header>' +
			"<uq-site-header hideMyLibrary hideAskUs></uq-site-header>" +
			"<cultural-advice-popup></cultural-advice-popup>" +
			"<proactive-chat></proactive-chat>",
	});

	app.component("prmTopbarAfter", {
		template: '<alert-list system="primo"></alert-list>',
	});

	// account options is a built in primo but that we alter, but cant directly offer the same functionality it does
	const accountLinkOptions = {
		title: "Library account",
		id: "mylibrary-menu-borrowing",
		svgString: '<svg viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M12 3C14.2222 3 16 4.77778 16 7C16 9.22222 14.2222 11 12 11C9.77778 11 8 9.22222 8 7C8 4.77778 9.77778 3 12 3Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M4.59961 20.5716C4.59961 16.4685 7.91578 13.1523 12.0188 13.1523C16.1219 13.1523 19.438 16.4685 19.438 20.5716" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>'
	};
	const vidParam = getSearchParam('vid');
	const favouriteLinkOptions = {
		title: "Favourites",
		id: "mylibrary-menu-saved-items",
		svgString: '<svg viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M12.6988 3.43449L14.9056 7.8896C14.9557 8.00269 15.0347 8.10063 15.1345 8.17369C15.2344 8.24675 15.3516 8.29235 15.4746 8.30597L20.3461 9.02767C20.4871 9.04581 20.6201 9.1037 20.7294 9.19458C20.8388 9.28545 20.9201 9.40559 20.9639 9.54094C21.0074 9.67627 21.0117 9.82125 20.9761 9.95891C20.9404 10.0966 20.8663 10.2213 20.7625 10.3184L17.2511 13.802C17.1615 13.8857 17.0942 13.9905 17.0554 14.1069C17.0167 14.2232 17.0075 14.3474 17.0291 14.4682L17.8757 19.3674C17.9001 19.5081 17.8847 19.653 17.831 19.7854C17.7771 19.9178 17.6873 20.0325 17.5717 20.1163C17.456 20.2003 17.3191 20.25 17.1765 20.2598C17.0339 20.2698 16.8915 20.2394 16.7654 20.1724L12.3796 17.8546C12.2673 17.7995 12.1439 17.7708 12.0188 17.7708C11.8936 17.7708 11.7702 17.7995 11.6579 17.8546L7.27219 20.1724C7.14601 20.2394 7.00355 20.2698 6.861 20.2598C6.71845 20.25 6.58153 20.2003 6.46585 20.1163C6.35016 20.0325 6.26034 19.9178 6.2066 19.7854C6.15286 19.653 6.13737 19.5081 6.16188 19.3674L7.00849 14.4127C7.02995 14.2919 7.02087 14.1677 6.98209 14.0514C6.9433 13.935 6.87604 13.8302 6.78643 13.7465L3.23344 10.3184C3.12833 10.2186 3.05441 10.0905 3.02063 9.94953C2.98686 9.80858 2.99468 9.66085 3.04315 9.52425C3.09162 9.38766 3.17866 9.26805 3.29372 9.17991C3.40879 9.09178 3.54694 9.0389 3.69145 9.02767L8.56292 8.30597C8.68589 8.29235 8.80314 8.24675 8.90298 8.17369C9.00281 8.10063 9.08177 8.00269 9.13195 7.8896L11.3387 3.43449C11.3988 3.30474 11.4947 3.19489 11.6153 3.1179C11.7358 3.04091 11.8758 3 12.0188 3C12.1617 3 12.3018 3.04091 12.4223 3.1179C12.5428 3.19489 12.6387 3.30474 12.6988 3.43449Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>',
		link: `/primo-explore/favorites?vid=${vidParam}&amp;lang=en_US&amp;section=items`,
	};
	const feedbackOptions = {
		title: "Feedback",
		ariaLabel: "Provide feedback",
		link: "https://support.my.uq.edu.au/app/library/feedback",
		id: "mylibrary-menu-feedback",
		svgString: '<svg viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
			'<path d="M19.7998 17.3998H11.3999L6.59995 20.9998V17.3998H4.19998C3.88173 17.3998 3.57651 17.2734 3.35147 17.0483C3.12643 16.8233 3 16.5181 3 16.1998V4.19998C3 3.88173 3.12643 3.57651 3.35147 3.35147C3.57651 3.12643 3.88173 3 4.19998 3H19.7998C20.118 3 20.4233 3.12643 20.6483 3.35147C20.8733 3.57651 20.9998 3.88173 20.9998 4.19998V16.1998C20.9998 16.5181 20.8733 16.8233 20.6483 17.0483C20.4233 17.2734 20.118 17.3998 19.7998 17.3998Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M6.59961 8.39941H17.3995" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'<path d="M6.59961 12H14.9995" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>',
		newWindow: true,
		className: "my-feedback-ctm",
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
			'<svg viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
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
		const ICON_SVG_PRINTER = 'M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z';
		return '<md-menu-item data-testid="ourPrintBalanceMenuItem" class="uql-account-menu-option">\n' +
			'    <button class="button-with-icon md-primoExplore-theme md-ink-ripple" type="button"' +
			'			data-analyticsid="mylibrary-menu-print-balance" aria-label="Go to Print balance" role="menuitem"' +
			'			onclick="javascript:window.open(\'https://web.library.uq.edu.au/library-services/it/print-scan-copy/your-printing-account\', \'_blank\');">\n' +
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
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
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
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

	// we dont always like their icons, so we just remove their icon
	// and insert one we like, having gotten the path for the svg from the mui icon list
	function rewriteProvidedPrimoButton(buttonOptions, primoIdentifier) {
		const button = document.querySelector(primoIdentifier + " button");
		if (!button) {
			return;
		}

		const awaitSVG = setInterval(() => {
			const cloneableSvg = document.querySelector(primoIdentifier + " svg");
			if (!!cloneableSvg) {
				clearInterval(awaitSVG);

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
				const primaryText = document.createTextNode(buttonOptions.title);
				const primaryTextBlock = document.createElement('span');
				!!primaryTextBlock && (primaryTextBlock.className = 'primaryText');
				!!primaryTextBlock && !!primaryText && primaryTextBlock.appendChild(primaryText);

				const textParent = document.createElement('div');
				!!textParent && (textParent.className = 'textwrapper');
				!!textParent && !!primaryTextBlock && textParent.appendChild(primaryTextBlock);
				!!button && !!textParent && button.appendChild(textParent);

				// add an ID for GTM usage to the button
				const menuItem = document.querySelector(primoIdentifier + ' button');
				!!menuItem && menuItem.setAttribute('data-analyticsid', buttonOptions.id);
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

						rewriteProvidedPrimoButton(accountLinkOptions, '.my-library-card-ctm');

						rewriteProvidedPrimoButton(favouriteLinkOptions, '.my-favorties-ctm');

						// remove the dividers, having removed all the contents of the block (TODO change to querySelectorAll)
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

	// prm-explore-footer-after
	app.component("prmExploreFooterAfter", {
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
						const createdMenuItem = document.getElementById(feedbackId);
						if (!!desiredParentMobile && !createdMenuItem) {
							desiredParentMobile.insertAdjacentHTML('beforeend', ourFeedbackMenuItem(feedbackId));

							const feedbackMenuItem = document.getElementById(feedbackId);
							!!feedbackMenuItem && feedbackMenuItem.classList.add(feedbackId);
							const feedbackButton = document.querySelector(`#${feedbackId} button`);
							!!feedbackButton && feedbackButton.classList.add('md-button');
							!!feedbackButton && feedbackButton.classList.remove('desktop-feedback')
							const feedbackSvg = document.querySelector(`#${feedbackId} svg`);
							!!feedbackSvg && feedbackSvg.classList.add(feedbackId);
						}

						removeElementWhenItAppears('.settings-container prm-authentication'); // "Log in" menu item that duplicates "My account" function
					}, 250);
				} else if (!!isDesktopMenuOpen) { // is desktop menu
					clearInterval(awaitLoggedout);

					const waitForDesktopFeedbackLink = setInterval(() => {
						const feedbackButton = document.getElementById(DESKTOP_LOGGED_OUT_FEEDBACK_ID);
						if (!feedbackButton) {
							clearInterval(waitForDesktopFeedbackLink);

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
			}, 250);
		},
	});

	app.component("prmSearchBookmarkFilterAfter", {
		controller: function ($scope) {
			// move the primo-login-bar up so it overlaps uq-site-header and is visually one bar
			var primoLoginBar = document.querySelector('prm-topbar>div.top-nav-bar.layout-row') || false;
			!!primoLoginBar && (primoLoginBar.style.marginTop = '-61px');
		},
		template: "<askus-button nopaneopacity></askus-button>",
	});

	function isDomainProd() {
		return window.location.hostname === "search.library.uq.edu.au";
	}

	function getPageVidValue() {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get('vid');
	}

	// determine if we are in the public environment, colloquially referred to as prod-prod
	// (to distinguish it from prod-dev and sandbox-prod)
	function isPublicEnvironment() {
		return isDomainProd() && getPageVidValue() === '61UQ';
	}

	function getSearchParam(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

	function getEnvironmentLabel() {
		if (isPublicEnvironment()) {
			return ''; //should never reach here
		}
		const vidParam = getPageVidValue();

		// 61UQ            => "PROD" (unless public domain)
		// 61UQ_APPDEV     => "APPDEV"
		// 61UQ_DAC        => "DAC"
		// SANDBOX_CANARY  => "SANDBOX CANARY" (no longer used)
		// 61UQ_CANARY     => "CANARY"
		let envLabel =  vidParam === '61UQ' ? 'PROD' : vidParam;
		envLabel = envLabel.replace('61UQ_', '')
			.replace('_', ' ')
			.toUpperCase();

		const domainLabel = isDomainProd() ? 'PROD' : 'SANDBOX';

		return `${domainLabel} ${envLabel}`;
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
			'<button class="help-button md-button md-primoExplore-theme md-ink-ripple" type="button" data-ng-click="buttonPressed($event)" aria-label="Report a Problem" aria-hidden="false">' +
			'<a ng-href="{{$ctrl.targeturl}}" target="_blank">Report a Problem</a>' +
			"</button>" +
			"</getit-link-service></div>",
	});

	/****************************************************************************************************/

	/*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

	/*var app = angular.module('centralCustom', ['angularLoad']);*/

	/****************************************************************************************************/

	// if the record is one of certain types, the 'Available Online' link should open View It, instead of jumping straight to the resource
	// (this is because there are usually multiple resources, and the default one may not be the best)
	app.controller("prmOpenSpecificTypesInFullController", [
		function () {
			var vm = this;
			vm.$onInit = function () {
				var resourceType =
					(!!vm.parentCtrl.result &&
						!!vm.parentCtrl.result.pnx &&
						!!vm.parentCtrl.result.pnx.display &&
						!!vm.parentCtrl.result.pnx.display.type &&
						vm.parentCtrl.result.pnx.display.type.length > 0 &&
						vm.parentCtrl.result.pnx.display.type[0]) ||
					"";
				if ([
					"journal",
					"newspaper",
					"magazine",
				].includes(resourceType)) {
					vm.parentCtrl.isDirectLink = function () {return false;};
				}
			};
		},
	]);
	app.component("prmOpenSpecificTypesInFull", {
		bindings: { parentCtrl: "<" },
		controller: "prmOpenSpecificTypesInFullController",
	});
	app.component("prmSearchResultAvailabilityLineAfter", {
		bindings: { parentCtrl: "<" },
		template:
			'<prm-open-specific-types-in-full parent-ctrl="$ctrl.parentCtrl"></prm-open-specific-types-in-full>',
	});

	/**
	 * show a little marker beside the "library homepage" link to indicate the current environment when not in prod-prod
	 */
	function addNonProdEnvironmentIndicator() {
		// this environment indicator label is not shown on prod-prod
		if (isPublicEnvironment()) {
			return;
		}

		const environmentIndicatorId = 'uql-env-indicator';

		const envInd = setInterval(() => {
			const uqheader = document.querySelector('uq-site-header');
			if (!!uqheader) {
				const shadowDom = !!uqheader && uqheader.shadowRoot;

				const currentEnvironmentIndicator = !!shadowDom && shadowDom.getElementById(environmentIndicatorId);
				if (!!currentEnvironmentIndicator) {
					clearInterval(envInd);
					return;
				}

				const siteTitle = !!shadowDom && shadowDom.getElementById('site-title');
				const siteTitleParent = !!siteTitle && siteTitle.parentNode;

				const envIndicatorWrapper = document.createElement('span');
				if (!!envIndicatorWrapper && !!siteTitleParent) {
                    clearInterval(envInd);

					envIndicatorWrapper.style.color = 'white';
					envIndicatorWrapper.style.backgroundColor = '#333';
					envIndicatorWrapper.style.padding = '8px';
					envIndicatorWrapper.style.marginLeft = '8px';
					envIndicatorWrapper.style.fontWeight = 'bold';
					envIndicatorWrapper.style.fontSize = '12px';
					envIndicatorWrapper.id = environmentIndicatorId;
					envIndicatorWrapper.setAttribute("data-testid", environmentIndicatorId);

					const environmentLabel = getEnvironmentLabel();
					const labelNode = !!environmentLabel && document.createTextNode(environmentLabel);
					!!labelNode && envIndicatorWrapper.appendChild(labelNode);

					siteTitleParent.appendChild(envIndicatorWrapper);
				}
			}
		}, 500);
	}

	// There are 3 places we add the custom indicators:
	// - on lists of search results
	// - on specific records
	// - and... some records have an entry like "2 versions of this item See all versions"
	// on them and when its clicked, it opens up a list view that has an extra record at the top
	// At the top of this list view is the third place we put the custom indicator
	// See canary tests for examples
	function createCustomIconIndicator(svgPathValue, iconWrapperClassName, labelText, uniqueId) {

		const iconClassName = `${iconWrapperClassName}Icon`;
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		!!path && path.setAttribute("d", svgPathValue);

		const svgCR = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		!!svgCR && svgCR.setAttribute("width", "100%");
		!!svgCR && svgCR.setAttribute("height", "100%");
		!!svgCR && svgCR.setAttribute("viewBox", "0 0 24 24");
		!!svgCR && svgCR.setAttribute("focusable", "false");
		!!svgCR && svgCR.setAttribute("class", "icon-after-icon");
		!!svgCR && !!path && svgCR.appendChild(path);

		const mdIcon = document.createElement("md-icon");
		!!mdIcon && mdIcon.setAttribute("role", "presentation");
		!!mdIcon && (mdIcon.className = "md-primoExplore-theme");
		!!mdIcon && !!svgCR && mdIcon.appendChild(svgCR);

		const prmIcon = document.createElement("span");
		!!prmIcon && (prmIcon.className = `${iconClassName} indicatorIcon`);
		!!prmIcon && !!mdIcon && prmIcon.appendChild(mdIcon);

		const contentLabel = document.createElement("span");
		!!contentLabel && (contentLabel.className = "customIndicatorLabel");
		!!contentLabel && (contentLabel.innerHTML = labelText);

		const iconWrapper = document.createElement("span");
		// iconWrapperClassName is used to hide any duplicate icons, which shouldnt happen, but rarely there is a race condition
		!!iconWrapper && (iconWrapper.className = `customIndicator ${iconWrapperClassName}`);
		!!iconWrapper && !!prmIcon && iconWrapper.appendChild(prmIcon);
		!!iconWrapper && !!contentLabel && iconWrapper.appendChild(contentLabel);

		return iconWrapper;
	}

	function getSnippet(selectorParent) {
		return document.querySelector(`${selectorParent} prm-snippet`);
	}

	function addCustomIconIndicatorToHeader(uniqueId, pageType, selectorParent, createdIndicator) {
		// if other icons ("Peer reviewed" "Open Access") are available, we will add it to that line
		let indicatorParent = false;
		const openAccessIndicator = document.querySelector(`${selectorParent} .open-access-mark`);
		if (!!openAccessIndicator) {
			indicatorParent = openAccessIndicator.parentNode;
		}
		if (!indicatorParent) {
			const peerReviewedIndicator = document.querySelector(`${selectorParent} .peer-reviewed-mark`);
			if (!!peerReviewedIndicator) {
				indicatorParent = peerReviewedIndicator.parentNode;
			}
		}

		if (!!indicatorParent) {
			indicatorParent.appendChild(createdIndicator);
		} else {
			// no exlibris-supplied icons on this entry? add it as a new line after the snippet
			// we have to make a wrapping div in case there is more than one Indicator, even though its rare
			// and of course we don't know if another Indicator creation has already happened....
			let indicatorWrapper = document.querySelector(`${selectorParent} div.indicatorWrapper`);
			if (!indicatorWrapper) {
				indicatorWrapper = document.createElement("div");
				!!indicatorWrapper && (indicatorWrapper.className = "indicatorWrapper");
				const snippet = getSnippet(selectorParent);
				!!snippet && !!indicatorWrapper && snippet.parentNode.insertBefore(indicatorWrapper, snippet.nextSibling);
			}
			if (!!indicatorWrapper) {
				indicatorWrapper.appendChild(createdIndicator);
			}
		}
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

	function addCulturalAdviceIndicatorToHeader(recordId, uniqueIdSuffix, pageType='full') {
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

		// because CA is determined so quickly, the page hasn't drawn yet - wait on the item we want to be the parent
		// snippet always eventually exists, even if its empty
		const waitforSnippetToExist = setInterval(() => {
			const selectorParent = getSelectorParent(recordId, pageType); // doesn't work without the repeated line
			const snippet = getSnippet(selectorParent);
			if (!!snippet) {
				clearInterval(waitforSnippetToExist);
				addCustomIconIndicatorToHeader(uniqueId, uniqueIdSuffix, selectorParent, createdIndicator);
			}
		}, 100);
		return true;
	}

	function addCourseResourceIndicatorToHeader(recordId, uniqueIdSuffix, pageType='full') {
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

		addCustomIconIndicatorToHeader(uniqueId, uniqueIdSuffix, selectorParent, createdIndicator);
		return true;
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
		// move these styles to the reusable scss file when it looks right
		!!para && (para.style.padding = "1em");
		!!para && (para.style.borderColor = "#bbd8f5");
		!!para && (para.style.color = "#000");
		!!para && (para.style.backgroundColor = "#bbd8f5");
		!!para && (para.style.borderRadius = "3px");
		!!para && (para.style.marginRight = "-2.50em");
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

	// loosely based on https://support.talis.com/hc/en-us/articles/115002712709-Primo-Explore-Integrations-with-Talis-Aspire
	// and https://github.com/alfi1/primo-aspire-api/blob/master/getAspireLists_Angular1-6.js
	// check for a reading list in the full results page and add an indicator and list if so
	app.component("prmServiceDetailsAfter", {
		bindings: { parentCtrl: "<" },
		controller: function ($scope, $http) {
			var vm = this;
			var unsafeReadingListBaseUrl = 'http://lr.library.uq.edu.au';
			var safeReadingListBaseUrl = 'https://uq.rl.talis.com';

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
							});
						})
						.finally(() => {
							if (Object.keys(courseList).length > 0) {
								$scope.hasCourses = true;

								const recordid = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
								if (!!recordid) {
									addCourseResourceIndicatorToHeader(recordid, "full");
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
									const talisUrl = fixUnsafeReadingListUrl(addUrlParam(entry[0], 'login', true));
									$scope.talisCourses[talisUrl] = subjectCode;
								});
							}
						});
				}

				function fixUnsafeReadingListUrl(url)
				{
					return url.replace(unsafeReadingListBaseUrl, safeReadingListBaseUrl);
				}

				function addUrlParam(url, name, value)
				{
					const param = value !== undefined ? `${name}=${value}` : name;
					const separator = url.includes('?') ? '&' : '?';
					return `${url}${separator}${param}`;
				}

				const listTalisUrls = vm?.parentCtrl?.item && getListTalisUrls(vm.parentCtrl.item);
				if (!!listTalisUrls && listTalisUrls.length > 0) {
					getTalisDataFromAllApiCalls(listTalisUrls);
				}

				// display the cultural advice indicator on appropriate records
				const recordId = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
				const culturalAdviceText = !!vm?.parentCtrl?.item?.pnx?.facets?.lfc04 && vm.parentCtrl.item.pnx.facets?.lfc04; // eg "Cultural advice - Aboriginal and Torres Strait Islander people"
				if (!!culturalAdviceText && !!recordId) {
					addCulturalAdviceIndicatorToHeader(recordId, "full");

					const culturalAdviceBody = !!vm?.parentCtrl?.item?.pnx?.search?.lsr47 && vm.parentCtrl.item.pnx.search?.lsr47; // eg "Aboriginal and Torres Strait Islander people are warned that this resource may contain ..."
					!!culturalAdviceBody && culturalAdviceBody.length > 0 && !!culturalAdviceBody[0] && addCulturalAdviceBanner(culturalAdviceBody[0]);
				}
			};
		},
		template:
			'<div class="readingListCitations" ng-show="hasCourses">' +
			"<h4>Course reading lists</h4>" +
			"<ul>" +
			'<li ng-repeat="(url,listname) in talisCourses">' +
			'<a href="{{url}}" target="_blank">{{listname}} </a>' +
			"</li>" +
			"</ul>" +
			"</div>",
	});

	// check for a reading list on each result in the brief result list (search results) and add an indicator if so
	app.component("prmBriefResultContainerAfter", {
		bindings: { parentCtrl: "<" },
		controller: function ($scope, $http) {
			var vm = this;

			this.$onInit = function () {
				$scope.listsFound = null;

				if (!!isFullDisplayPage()) {
					return;
				}

				function getTalisDataFromFirstSuccessfulApiCall(listUrlsToCall) {
					const url = listTalisUrls.shift();
					url.startsWith("http") && $http.jsonp(url, { jsonpCallbackParam: "cb" })
						.then(function handleSuccess(response) {
							$scope.listsFound = response.data || null;
							if (!$scope.listsFound && listUrlsToCall.length > 0) {
								getTalisDataFromFirstSuccessfulApiCall(listUrlsToCall);
							}
							if (!!$scope.listsFound) {
								const recordid = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // 61UQ_ALMA51124881340003131
								if (!!recordid) {
									const parentCtrl = $scope.$ctrl.parentCtrl;
									const isSelectedVersion = parentCtrl.$element[0].classList.contains('list-item-wrapper');
									const pageType = isSelectedVersion ? 'specificversion' : 'brief';
									addCourseResourceIndicatorToHeader(recordid, "brief", pageType);
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
				const parentCtrl = $scope.$ctrl.parentCtrl;
				const isSelectedVersion = parentCtrl.$element[0].classList.contains('list-item-wrapper');
				const pageType = isSelectedVersion ? 'specificversion' : 'brief';
				const recordId = !!vm?.parentCtrl?.item?.pnx?.control?.recordid && vm.parentCtrl.item.pnx.control.recordid; // eg 61UQ_ALMA51124881340003131
				const recordCount = !!vm?.parentCtrl?.resultUtil?._updatedBulkSize ? vm.parentCtrl.resultUtil._updatedBulkSize : false; // eg 61UQ_ALMA51124881340003131
				const culturalAdviceText = !!vm?.parentCtrl?.item?.pnx?.facets?.lfc04 && vm.parentCtrl.item.pnx.facets?.lfc04; // "eg Aboriginal and Torres Strait Islander people are warned that this resource may contain ..."
				if (!!culturalAdviceText && !!recordId) {
					addCulturalAdviceIndicatorToHeader(recordId, `brief-${recordCount}`, pageType);
				}
			};
		},
		template: "",
	});

	app.component('prmFacetExactAfter', {
		bindings: { parentCtrl: "<" },
		controller: function ($scope, $http) {
			const awaitOpenAccessEntry = setInterval(() => {
				const openAccessEntry = document.querySelector('[title="Open Access"]');
				if (!!openAccessEntry) {
					clearInterval(awaitOpenAccessEntry);
					const openAccessId = 'LTSaddedOpenAccessCount';
					const addedOACountByLTSId = document.getElementById(openAccessId);
					// if exlibris has already provided the OA count, it will have this class. Don't duplicate it.
					const existingCountCheck  = !!openAccessEntry && openAccessEntry.parentNode.querySelector('.text-in-brackets');
					if (!addedOACountByLTSId && !existingCountCheck) {
						const openAccessParent = !!openAccessEntry && openAccessEntry.parentNode;
						const ariaLabel = !!openAccessParent && openAccessParent.getAttribute('aria-label');
						// This assumes an aria-label attribute of the format `Open Access 134,304 Search results`,
						// which we strip down to '134,304'.
						// Don't extract non-numerics in case Exlibris update the label to include a number - it would
						// make all the displays wrong without being noticeable
						const oaCount = !!ariaLabel && ariaLabel.replace('Open Access', '')
							.replace('Search results', '')
							.trim();
						const textNode = !!oaCount && document.createTextNode(oaCount);
						const wrapperSpan = !!textNode && document.createElement('span');
						!!wrapperSpan && !!textNode && wrapperSpan.appendChild(textNode);
						!!wrapperSpan && wrapperSpan.classList.add('text-italic', 'text-in-brackets', 'text-rtl', 'facet-counter');
						!!wrapperSpan && (wrapperSpan.style.paddingLeft = '10px');
						!!wrapperSpan && (wrapperSpan.id = openAccessId);

						!!openAccessEntry && !!wrapperSpan && openAccessEntry.appendChild(wrapperSpan);
					}
				}
			}, 500);
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
	var folder = "/"; // default. Use for prod.
	if (isDomainProd()) {
		if (/vid=61UQ_APPDEV/.test(window.location.href)) {
			folder = "-development/primo-prod-dev/";
		}
	} else {
		if (/vid=61UQ_APPDEV/.test(window.location.href)) {
			folder = "-development/primo-sandbox-dev/";
		} else if (/vid=61UQ/.test(window.location.href)) {
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

	addNonProdEnvironmentIndicator();
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
