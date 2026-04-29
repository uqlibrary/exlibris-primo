import {Component} from '@angular/core';

@Component({
  selector: 'custom-nde-update-account-menu-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-update-account-menu-custom.component.html',
  styleUrl: './nde-update-account-menu-custom.component.scss'
})
export class NdeUpdateAccountMenuCustomComponent {
    ngOnInit(): void {
        setInterval(() => { // never ended as we have to re add the user's name every time they log in
            // replace provided initials with the user's name (note we cannot rely on the ng-star-inserted class, it isn't reliable :( )
            const isLoggedOut = document.querySelector('nde-user-area button.user-area-btn div');

            if (!!isLoggedOut) {
                this.attachLoggedoutButtonContents()
            }

            const userNameAreaButton = document.querySelector('nde-user-area button');
            if (!!userNameAreaButton) { // should always be present
                this.attachArrowButtons(userNameAreaButton);
            }

            if (isLoggedOut) {
                this.removeAccountButton();
                this.addFeedbackitemToMenu();
            } else {
                this.reLabelAccountButton();
                this.styleUserName();
                this.addLoggedOutExtraMenuItems();
                this.addFeedbackitemToMenu(); // must happen before logout move

                this.reLabelFavourites();
                this.reLabelSearchHistory(); // probably deleted in configuration

                this.moveFavouritesDown();
                this.addPurchaseRequestItemToMenu();
                this.addResourceDeliveryItemToMenu();

                this.moveLogoutButton();
            }
        }, 100);
    }

    private getAccountMenu = () => {
        return document.querySelector('.user-area-sub-menu .mat-mdc-menu-content');
    }

/*
.primo-account-sub-menu li {
    margin-left: 2rem
}
*/


    private getSubAccountMenu = () => {
        const menuparent = document.getElementById('primo-account-sub-menu');
        if (!menuparent) {
            const previousElement = document.querySelector('[aria-label="Go to my library account"]');
            const newUlTemplate = document.createElement('template');
            newUlTemplate.innerHTML = '<ul id="primo-account-sub-menu" class="primo-account-sub-menu"></ul>'
            !!newUlTemplate && !!previousElement && previousElement.after(newUlTemplate.content.cloneNode(true));
        }
        return document.getElementById('primo-account-sub-menu');
    }

    private styleUserName = () => {
        const desiredUserDisplayName = this.getDesiredUserDisplayName();
        const userNameDisplayArea = document.querySelector('nde-user-area button.user-area-btn span:not(.mat-mdc-button-persistent-ripple):not(.mat-focus-indicator):not(.mat-mdc-button-touch-target):not(.mat-ripple)');
        if (!userNameDisplayArea?.classList.contains('styledUserName')) {
            !!desiredUserDisplayName && !!userNameDisplayArea && (userNameDisplayArea.textContent = desiredUserDisplayName);
            !!userNameDisplayArea && !userNameDisplayArea.classList.contains('styledUserName') && userNameDisplayArea.classList.add('styledUserName');
        }
    }

    private moveLogoutButton(existingButtonLabel = ' Log out') {
        const accountMenu = this.getAccountMenu();
        if (!accountMenu) {
            return;
        }

        const logoutButton = document.querySelector(`.user-area-sub-menu > div > button[aria-label="${existingButtonLabel}"]`);
        if (!logoutButton) {
            return; // logout button not available
        }

        const logoutButtonAlreadyMoved = document.querySelector('.user-area-sub-menu span+button'); // if we have already moved the button then it comes _after_ the anchors
        if (!!logoutButtonAlreadyMoved) {
            return;
        }

        // add an element to hold the divider above the button
        const dividerTemplate = document.createElement('template');
        !!dividerTemplate && (dividerTemplate.innerHTML = `<span class="menu-section-divider"></span>`);
        !!dividerTemplate && !!accountMenu && accountMenu.appendChild(dividerTemplate.content.cloneNode(true));

        // move the log-out button
        !!accountMenu && !!logoutButton && accountMenu.appendChild(logoutButton);

        // get rid of the existing icons
        const existingLogoutSvg = document.querySelector('button[aria-label=" Log out"] mat-icon svg');
        !!existingLogoutSvg && existingLogoutSvg.remove();

        // insert our own icon
        const logoutIconTemplate = document.createElement('template');
        logoutIconTemplate.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><g clip-path="url(#clip0_1654_3032)"><path d="M17.0859 9.00293H5.76562" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.46094 11.6982L5.76562 9.00293L8.46094 6.30762" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.6954 12.2344V15.4688C11.7077 15.7416 11.6115 16.0081 11.4278 16.2102C11.2441 16.4122 10.9878 16.5333 10.715 16.5469H1.89383C1.62121 16.5331 1.36513 16.412 1.18156 16.2099C0.997988 16.0079 0.901855 15.7414 0.91417 15.4688V2.53125C0.901664 2.25851 0.997731 1.99193 1.18134 1.78987C1.36495 1.5878 1.62114 1.46672 1.89383 1.45312H10.715C10.9878 1.46672 11.2441 1.58778 11.4278 1.78982C11.6115 1.99186 11.7077 2.25844 11.6954 2.53125V5.76562" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_1654_3032"><rect width="18" height="18"/></clipPath></defs></svg>`
        const logoutMatIcon = document.querySelector('[aria-label=" Log out"] mat-icon');
        !!logoutIconTemplate && !!logoutMatIcon && logoutMatIcon.appendChild(logoutIconTemplate.content.cloneNode(true));
    }

    private removeAccountButton() {
        // when logged out, we don't show the account button
        const accountButtonFound = document.querySelector(`.user-area-sub-menu a[aria-label="Go to my library account"]`);
        !!accountButtonFound && accountButtonFound.remove();
    }

    private reLabelAccountButton() {
        const newAccountIcon = document.getElementById('library-account-icon');
        if (!!newAccountIcon) {
            return; // already done
        }

        const accountButtonFound = document.querySelector(`.user-area-sub-menu a[aria-label="Go to my library account"]`);
        if (!accountButtonFound) {
            return; // buttons not available yet
        }

        // get rid of the existing icons
        const existingAccountSvg = document.querySelector('[aria-label="Go to my library account"] mat-icon svg');
        !!existingAccountSvg && existingAccountSvg.remove();

        // insert our own icon
        const accountIconTemplate = document.createElement('template');
        accountIconTemplate.innerHTML = `<svg data-testid="library-account-icon" id="library-account-icon" class="library-account-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 3C14.2222 3 16 4.77778 16 7C16 9.22222 14.2222 11 12 11C9.77778 11 8 9.22222 8 7C8 4.77778 9.77778 3 12 3Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.59961 20.5716C4.59961 16.4685 7.91578 13.1523 12.0188 13.1523C16.1219 13.1523 19.438 16.4685 19.438 20.5716" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
        const accountMatIcon = document.querySelector('[aria-label="Go to my library account"] mat-icon');
        !!accountIconTemplate && !!accountMatIcon && accountMatIcon.appendChild(accountIconTemplate.content.cloneNode(true));

        // tweak the looknfeel - we want "hollow" icons
        !!accountMatIcon && accountMatIcon.classList.contains('grey-icon-color-no-stroke') && accountMatIcon.classList.remove('grey-icon-color-no-stroke');
    }

    private reLabelFavourites() {
        const newFavouritesIcon = document.getElementById('library-favourites-icon');
        if (!!newFavouritesIcon) {
            return; // already done
        }

        // update the label
        const savedItemsElement = document.querySelector('[aria-label="Go to my saved records"] span span')
        !!savedItemsElement && (savedItemsElement.textContent = 'Favourites');

        // get rid of the provided icon
        const existingSavedItemsSvg = document.querySelector('[aria-label="Go to my saved records"] mat-icon svg');
        !!existingSavedItemsSvg && existingSavedItemsSvg.remove();

        // insert our own icon - use the pin icon, as used in primo page body
        const favouritesIconTemplate = document.createElement('template');
        favouritesIconTemplate.innerHTML = `
            <svg data-testid="library-favourites-icon" id="library-favourites-icon" class="library-favourites-icon" height="100%" viewBox="0 -960 960 960" width="100%" fill="inherit" fit="" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
                <path d="m480-240-168 72q-40 17-76-6.5T200-241v-519q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v519q0 43-36 66.5t-76 6.5l-168-72Zm0-88 200 86v-518H280v518l200-86Zm0-432H280h400-200Z"></path>
            </svg>`;
        const savedItemsMatIcon = document.querySelector('[aria-label="Go to my saved records"] mat-icon');
        !!favouritesIconTemplate && !!savedItemsMatIcon && savedItemsMatIcon.appendChild(favouritesIconTemplate.content.cloneNode(true));

        // tweak the looknfeel - we want "hollow" icons
        !!savedItemsMatIcon && !!savedItemsMatIcon.classList.contains('grey-icon-color-no-stroke') && savedItemsMatIcon.classList.remove('grey-icon-color-no-stroke');
    }

    private reLabelSearchHistory() {
        const existingSearchHistoryItem = document.querySelector('[aria-label="Go to my search history"]');
        if (!existingSearchHistoryItem) {
            // Stacey will probably remove this item
            return;
        }

        const newSearchHistoryIcon = document.getElementById('library-search-history-icon');
        if (!!newSearchHistoryIcon) {
            return; // already done
        }

        // get rid of the provided icon
        const existingSearchHistorySvg = document.querySelector('[aria-label="Go to my search history"] mat-icon svg');
        !!existingSearchHistorySvg && existingSearchHistorySvg.remove();

        // insert our own icon
        const searchHistoryIconTemplate = document.createElement('template');
        searchHistoryIconTemplate.innerHTML = `
            <svg data-testid="library-search-history-icon" id="library-search-history-icon" class="library-search-history-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <path d="M12.6988 3.43449L14.9056 7.8896C14.9557 8.00269 15.0347 8. xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="m1.28357 10.0561 4.62088 -4.62085 4.62085 4.62085" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M16.3781 3.59541c0.8513 0.222 1.6617 0.57897 2.4001 1.05734" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M20.9083 6.59988c0.5458 0.69012 0.9765 1.46398 1.2753 2.29161" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M22.7161 11.7216c0.0081 0.8795 -0.1126 1.7556 -0.3582 2.6002" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M21.0655 16.8988c-0.5124 0.7159 -1.139 1.3425 -1.8548 1.8549" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M16.6336 20.0461c-0.8446 0.2456 -1.7206 0.3662 -2.6002 0.3581" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M11.1999 19.8717c-0.8263 -0.2993 -1.59897 -0.7299 -2.28816 -1.2753" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M6.96456 16.4663c-0.47872 -0.7382 -0.83571 -1.5486 -1.05733 -2.4001" stroke-width="1.5"></path>
              <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M5.90442 10.7322V5.43525" stroke-width="1.5"></path>
            </svg>`;
        const savedItemsMatIcon = document.querySelector('[aria-label="Go to my search history"] mat-icon');
        !!searchHistoryIconTemplate && !!savedItemsMatIcon && savedItemsMatIcon.appendChild(searchHistoryIconTemplate.content.cloneNode(true));

        // tweak the looknfeel - we want "hollow" icons
        !!savedItemsMatIcon && !!savedItemsMatIcon.classList.contains('grey-icon-color-no-stroke') && savedItemsMatIcon.classList.remove('grey-icon-color-no-stroke');
    }

    private addLoggedOutExtraMenuItems() {
        // we add the Learning resources, Print balance, uqbookit and feedback links to the account menu
        const accountMenu = this.getAccountMenu();
        if (!accountMenu) {
            return;
        }

        const newMenuItemAdded = document.getElementById('first-added-menu-item');
        if (!!newMenuItemAdded) {
            return; // we've already inserted the extra items
        }

        const extraLinksTemplate = document.createElement('template');
        extraLinksTemplate.innerHTML = `<a id="first-added-menu-item" _ngcontent-ng-c4231447735="" tabindex="0" mat-menu-item="" class="mat-mdc-menu-item mat-focus-indicator" role="menuitem" aria-disabled="false" data-analyticsid="mylibrary-menu-course-resources" aria-label="Go to Learning resources" href="https://www.library.uq.edu.au/learning-resources">
  <mat-icon _ngcontent-ng-c4231447735="" role="img" class="mat-icon notranslate nde-mat-icon-size account-option-icon" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="savedRecords">
    <svg data-testid="library-learning-resources-icon" class="library-learning-resources-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M11.9999 21.4003V6.78587C11.9999 6.78587 9.94278 4.51443 2.99986 4.42871C2.87129 4.42871 2.78558 4.47157 2.69986 4.55728C2.61415 4.643 2.57129 4.72871 2.57129 4.85729V18.5717C2.57129 18.786 2.74272 19.0003 2.99986 19.0003C9.94278 19.1288 11.9999 21.4003 11.9999 21.4003Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M9.46999 12.2291C8.05569 11.7577 6.55568 11.4577 5.05566 11.3291" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M9.46999 15.7428C8.05569 15.2713 6.55568 14.9713 5.05566 14.8428" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M14.5293 12.2291C15.9436 11.7577 17.4436 11.4577 18.9436 11.3291" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M14.5293 15.7428C15.9436 15.2713 17.4436 14.9713 18.9436 14.8428" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M12.001 21.4003V6.78587C12.001 6.78587 14.0581 4.51443 21.001 4.42871C21.1296 4.42871 21.2153 4.47157 21.3011 4.55728C21.3868 4.643 21.4296 4.72871 21.4296 4.85729V18.5717C21.4296 18.786 21.2582 19.0003 21.001 19.0003C14.0581 19.1288 12.001 21.4003 12.001 21.4003Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  </mat-icon>
    <div class="textwrapper">
        <span class="primaryText">Learning resources</span>
    </div>
</a>
<a _ngcontent-ng-c4231447735="" tabindex="0" mat-menu-item="" class="mat-mdc-menu-item mat-focus-indicator" role="menuitem" aria-disabled="false" data-analyticsid="mylibrary-menu-print-balance" aria-label="Go to Print balance" href="https://web.library.uq.edu.au/library-and-student-it-help/print-scan-and-copy/your-printing-account">
    <mat-icon _ngcontent-ng-c4231447735="" role="img" class="mat-icon notranslate nde-mat-icon-size account-option-icon" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="savedRecords">
      <svg data-testid="library-print-balance-icon" class="library-print-balance-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <g clip-path="url(#clip0_1723_14098)">
          <path d="M3.01562 12C3.01563 14.3828 3.96219 16.668 5.64709 18.3529C7.33198 20.0378 9.6172 20.9844 12 20.9844C14.3828 20.9844 16.668 20.0378 18.3529 18.3529C20.0378 16.668 20.9844 14.3828 20.9844 12C20.9844 9.6172 20.0378 7.33198 18.3529 5.64709C16.668 3.96219 14.3828 3.01563 12 3.01562C9.6172 3.01563 7.33198 3.96219 5.64709 5.64709C3.96219 7.33198 3.01563 9.6172 3.01562 12Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M10.2031 13.7969C10.2031 14.1523 10.3085 14.4997 10.506 14.7952C10.7034 15.0907 10.984 15.321 11.3124 15.457C11.6407 15.593 12.002 15.6286 12.3506 15.5592C12.6991 15.4899 13.0193 15.3188 13.2706 15.0675C13.5219 14.8162 13.693 14.496 13.7623 14.1474C13.8317 13.7989 13.7961 13.4376 13.6601 13.1092C13.5241 12.7809 13.2938 12.5003 12.9983 12.3028C12.7028 12.1054 12.3554 12 12 12C11.6446 12 11.2972 11.8946 11.0017 11.6972C10.7062 11.4997 10.4759 11.2191 10.3399 10.8908C10.2039 10.5624 10.1683 10.2011 10.2377 9.85257C10.307 9.50401 10.4781 9.18384 10.7294 8.93254C10.9807 8.68125 11.3009 8.51011 11.6494 8.44078C11.998 8.37144 12.3593 8.40703 12.6876 8.54303C13.016 8.67903 13.2966 8.90934 13.494 9.20484C13.6915 9.50033 13.7969 9.84774 13.7969 10.2031" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M12 7.20801V8.40592" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M12 15.5938V16.7917" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path>
        </g>
        <defs><clipPath id="clip0_1723_14098"><rect width="20" height="20" fill="white" transform="translate(2 2)"></rect></clipPath></defs>
      </svg>
    </mat-icon>
    <div class="textwrapper">
        <span class="primaryText">Print balance</span>
    </div>
</a>
<a _ngcontent-ng-c4231447735="" tabindex="0" mat-menu-item="" class="mat-mdc-menu-item mat-focus-indicator" role="menuitem" aria-disabled="false" data-analyticsid="mylibrary-menu-room-bookings" aria-label="Go to Book a room or desk" href="https://uqbookit.uq.edu.au/#/app/booking-types/77b52dde-d704-4b6d-917e-e820f7df07cb">
    <mat-icon _ngcontent-ng-c4231447735="" role="img" class="mat-icon notranslate nde-mat-icon-size account-option-icon" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="savedRecords">
      <svg data-testid="library-room-booking-icon" class="library-room-booking-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M2.18907 3.41406H17.8109C18.467 3.41406 19 3.94588 19 4.60043V17.8141C19 18.4686 18.467 19.0004 17.8109 19.0004H2.18907C1.53303 19.0004 1 18.4686 1 17.8141V4.60043C1 3.94588 1.53303 3.41406 2.18907 3.41406Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path><path d="M1 8.2002H18.5399" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.79688 5.21364V1" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path><path d="M14.2441 5.21364V1" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </mat-icon>
    <div class="textwrapper">
        <span class="primaryText">Book a room or desk</span>
    </div>
</a>`;
        !!extraLinksTemplate && !!accountMenu && accountMenu.appendChild(extraLinksTemplate.content.cloneNode(true));
    }

    private moveFavouritesDown = () => {
        const movedFavouriteId = 'movedFavouriteWrapper';

        const movedFavourite = document.getElementById(movedFavouriteId);
        if (!!movedFavourite) {
            return; // done
        }

        const wrappingUl = this.getSubAccountMenu();
        const favouritesItem = document.querySelector('[aria-label="Go to my saved records"]');
        if (!favouritesItem || !wrappingUl) {
            return;
        }

        const newLi = document.createElement('li');
        !!newLi && (newLi.id = movedFavouriteId);
        !!newLi && newLi.appendChild(favouritesItem)

        !!newLi && !!wrappingUl && wrappingUl.appendChild(newLi);
    }

    private addPurchaseRequestItemToMenu = () => {
        const newPurchaseRequestItemId = 'newPurchaseRequestItem';

        const newPurchaseRequestItem = document.getElementById(newPurchaseRequestItemId);
        if (!!newPurchaseRequestItem) {
            return; // already done
        }

        const wrappingUl = this.getSubAccountMenu();
        if (!wrappingUl) {
            return;
        }

        const purchaseRequestLink = `/nde/purchaseRequest?vid=${(this.currentEnvironmentId())}&lang=en`;

        const newPurchaseRequestItemElementTemplate = document.createElement('template');
        newPurchaseRequestItemElementTemplate.innerHTML = `<li id="${newPurchaseRequestItemId}">
     <a href="${purchaseRequestLink}" _ngcontent-ng-purchaseR="" tabindex="0" mat-menu-item="" class="mat-mdc-menu-item mat-focus-indicator ng-star-inserted" aria-label="Go to my saved records" role="menuitem" aria-disabled="false">
    <mat-icon _ngcontent-ng-purchaseR="" role="img" class="mat-icon notranslate nde-mat-icon-size account-option-icon mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="savedRecords">
        <!-- https://www.streamlinehq.com/icons/ultimate-regular-free?search=purchase&icon=ico_v4Vh7ZbGJr0iLNCP -->
        <svg style="opacity: 70%;" data-testid="library-purchase-request-icon" id="library-purchase-request-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
          <path style="fill: none" stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M18.552 8.022c-0.0082 -0.32529 -0.1373 -0.63586 -0.3621 -0.87106 -0.2249 -0.2352 -0.5293 -0.37816 -0.8539 -0.40094H6.663c-0.3245 0.0228 -0.62882 0.16579 -0.85351 0.40102 -0.22469 0.23522 -0.35358 0.54578 -0.36149 0.87098L3.757 18.68c-0.03001 0.1838 -0.02188 0.3718 0.0239 0.5523s0.12822 0.3496 0.24219 0.4969c0.11397 0.1473 0.25703 0.2695 0.42028 0.3591 0.16325 0.0896 0.34319 0.1446 0.52863 0.1617h14.055c0.1855 -0.0169 0.3656 -0.0719 0.5289 -0.1614 0.1634 -0.0895 0.3066 -0.2118 0.4207 -0.359 0.114 -0.1473 0.1966 -0.3165 0.2424 -0.4971 0.0458 -0.1806 0.054 -0.3686 0.024 -0.5525L18.552 8.022Z" stroke-width="1.5"></path>
          <path style="fill: none" stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M8.24996 6.75017c0 -0.707 -0.537 -5.278 3.74804 -5.278 4.271 0 3.752 4.667 3.752 5.278" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M13.6499 10.5h-2.033c-0.3115 0.0002 -0.6133 0.1088 -0.8535 0.3072 -0.2403 0.1984 -0.404 0.4742 -0.4631 0.7801 -0.0592 0.3059 -0.01 0.6229 0.139 0.8965 0.149 0.2736 0.3886 0.4869 0.6776 0.6032l2.064 0.825c0.2897 0.1159 0.53 0.3291 0.6795 0.603 0.1495 0.2738 0.1989 0.5912 0.1397 0.8976 -0.0592 0.3063 -0.2232 0.5825 -0.464 0.7809 -0.2408 0.1985 -0.5431 0.3069 -0.8552 0.3065h-2.031" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M12.15 10.5v-0.75" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M12.15 17.25v-0.75" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M0.75 3.75v-1.5c0 -0.39782 0.158035 -0.77936 0.43934 -1.06066C1.47064 0.908035 1.85218 0.75 2.25 0.75h1.5" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M23.25 3.75v-1.5c0 -0.39782 -0.158 -0.77936 -0.4393 -1.06066C22.5294 0.908035 22.1478 0.75 21.75 0.75h-1.5" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M0.75 20.25v1.5c0 0.3978 0.158035 0.7794 0.43934 1.0607 0.2813 0.2813 0.66284 0.4393 1.06066 0.4393h1.5" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M23.25 20.25v1.5c0 0.3978 -0.158 0.7794 -0.4393 1.0607s-0.6629 0.4393 -1.0607 0.4393h-1.5" stroke-width="1.5"></path>
        </svg>
    </mat-icon>
    <span class="mat-mdc-menu-item-text">
        <span _ngcontent-ng-purchaseR="">Purchase request</span>
    </span>
    <div matripple="" class="mat-ripple mat-mdc-menu-ripple"></div>
</a>
 </li>`;
        !!newPurchaseRequestItemElementTemplate && !!wrappingUl && wrappingUl.appendChild(newPurchaseRequestItemElementTemplate.content.cloneNode(true));
    }

    private currentEnvironmentId = () => {
        let result;

        const paramName ='vid';
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has(paramName)) {
            result = urlParams.get(paramName);
        } else {
            const pathSegments = window.location.pathname.split('/');
            const institutionSegment = pathSegments.find(segment =>
                segment.includes('61UQ_INST:')
            );
            result = institutionSegment || null;
        }
        return result;
    }

    private addResourceDeliveryItemToMenu = () => {
        const newResourceDeliveryItemId = 'newResourceDeliveryItem';

        const newResourceDeliveryItem = document.getElementById(newResourceDeliveryItemId);
        if (!!newResourceDeliveryItem) {
            return; // already done
        }

        const wrappingUl = this.getSubAccountMenu();
        if (!wrappingUl) {
            return;
        }

        const resourceDeliveryLink = `/nde/blankIll?vid=${(this.currentEnvironmentId())}&lang=en`;

        const newResourceDeliveryItemElementTemplate = document.createElement('template');
        newResourceDeliveryItemElementTemplate.innerHTML = `<li id="${newResourceDeliveryItemId}">
     <a href="${resourceDeliveryLink}" _ngcontent-ng-purchaseR="" tabindex="0" mat-menu-item="" class="mat-mdc-menu-item mat-focus-indicator ng-star-inserted" aria-label="Go to my saved records" role="menuitem" aria-disabled="false">
    <mat-icon _ngcontent-ng-purchaseR="" role="img" class="mat-icon notranslate nde-mat-icon-size account-option-icon mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="savedRecords">
        <!-- https://www.streamlinehq.com/icons/ultimate-regular-free?search=delivery&icon=ico_xMA5XVKN6GelEGXS -->
        <svg style="opacity: 70%;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
          <path style="fill: none" stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M0.755981 16.5H16.714c0.3596 0.0006 0.7075 -0.128 0.9803 -0.3624 0.2727 -0.2344 0.4522 -0.559 0.5057 -0.9146l1.864 -12.446c0.0534 -0.35513 0.2324 -0.67933 0.5045 -0.91366 0.2722 -0.23434 0.6194 -0.36326 0.9785 -0.36334h1.709" stroke-width="1.5"></path>
          <path style="fill: none" stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M3.00598 7.5h4.5s0.75 0 0.75 0.75v4.5s0 0.75 -0.75 0.75h-4.5s-0.75 0 -0.75 -0.75v-4.5s0 -0.75 0.75 -0.75Z" stroke-width="1.5"></path>
          <path style="fill: none" stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M9.00598 4.5H15.006s0.75 0 0.75 0.75v7.5s0 0.75 -0.75 0.75H9.00598s-0.75 0 -0.75 -0.75v-7.5s0 -0.75 0.75 -0.75Z" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M2.25598 20.625c0 0.2462 0.0485 0.49 0.14273 0.7175 0.09422 0.2275 0.23234 0.4342 0.40645 0.6083 0.17411 0.1741 0.3808 0.3122 0.60829 0.4065 0.22749 0.0942 0.4713 0.1427 0.71753 0.1427s0.49005 -0.0485 0.71753 -0.1427c0.22749 -0.0943 0.43419 -0.2324 0.6083 -0.4065 0.17411 -0.1741 0.31222 -0.3808 0.40645 -0.6083 0.09422 -0.2275 0.14272 -0.4713 0.14272 -0.7175 0 -0.4973 -0.19754 -0.9742 -0.54917 -1.3258 -0.35163 -0.3517 -0.82855 -0.5492 -1.32583 -0.5492 -0.49728 0 -0.97419 0.1975 -1.32582 0.5492 -0.35163 0.3516 -0.54918 0.8285 -0.54918 1.3258Z" stroke-width="1.5"></path>
          <path stroke="#51247a" stroke-linecap="round" stroke-linejoin="round" d="M12.756 20.625c0 0.4973 0.1975 0.9742 0.5492 1.3258 0.3516 0.3517 0.8285 0.5492 1.3258 0.5492 0.4973 0 0.9742 -0.1975 1.3258 -0.5492 0.3516 -0.3516 0.5492 -0.8285 0.5492 -1.3258 0 -0.4973 -0.1976 -0.9742 -0.5492 -1.3258 -0.3516 -0.3517 -0.8285 -0.5492 -1.3258 -0.5492 -0.4973 0 -0.9742 0.1975 -1.3258 0.5492 -0.3517 0.3516 -0.5492 0.8285 -0.5492 1.3258Z" stroke-width="1.5"></path>
        </svg>
    </mat-icon>
    <span class="mat-mdc-menu-item-text">
        <span _ngcontent-ng-purchaseR="">Resource delivery request </span>
    </span>
    <div matripple="" class="mat-ripple mat-mdc-menu-ripple"></div>
</a>
 </li>`;
        !!newResourceDeliveryItemElementTemplate && !!wrappingUl && wrappingUl.appendChild(newResourceDeliveryItemElementTemplate.content.cloneNode(true));
    }

    private addFeedbackitemToMenu = () => {
        const accountMenu = this.getAccountMenu();
        if (!accountMenu) {
            return;
        }

        const existingFeedbackItem = document.getElementById('feedback-account-menu-item');
        if (!!existingFeedbackItem) {
            return;
        }

        const feedbackItemTemplate = document.createElement('template');
        feedbackItemTemplate.innerHTML = `<a id="feedback-account-menu-item" _ngcontent-ng-c4231447735="" tabindex="0" mat-menu-item="" class="mat-mdc-menu-item mat-focus-indicator" role="menuitem" aria-disabled="false" data-analyticsid="mylibrary-menu-feedback" aria-label="Provide feedback" href="https://support.my.uq.edu.au/app/library/feedback">
    <mat-icon _ngcontent-ng-c4231447735="" role="img" class="mat-icon notranslate nde-mat-icon-size account-option-icon" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="savedRecords">
      <svg data-testid="library-feedback-icon" class="library-feedback-icon" id="library-feedback-icon" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7998 17.3998H11.3999L6.59995 20.9998V17.3998H4.19998C3.88173 17.3998 3.57651 17.2734 3.35147 17.0483C3.12643 16.8233 3 16.5181 3 16.1998V4.19998C3 3.88173 3.12643 3.57651 3.35147 3.35147C3.57651 3.12643 3.88173 3 4.19998 3H19.7998C20.118 3 20.4233 3.12643 20.6483 3.35147C20.8733 3.57651 20.9998 3.88173 20.9998 4.19998V16.1998C20.9998 16.5181 20.8733 16.8233 20.6483 17.0483C20.4233 17.2734 20.118 17.3998 19.7998 17.3998Z" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6.59961 8.39941H17.3995" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6.59961 12H14.9995" stroke="#51247A" stroke-linecap="round" stroke-linejoin="round"></path></svg>
    </mat-icon>
    <div class="textwrapper">
      <span class="primaryText">Feedback</span>
    </div>
</a>`;
        !!feedbackItemTemplate && !!accountMenu && accountMenu.appendChild(feedbackItemTemplate.content.cloneNode(true));
    }
// add some up down arrows for Library-styled Account button (appearance controlled with css)
    // we attach the arrows once and then just show-hide
    // arrow id placed first because NDE will load and get rid of the name element after it
    private attachArrowButtons = (userNameAreaButtonLocal: Element) => {
        const arrowDownElementCreated = document.getElementById('down-arrow');
        const arrowUpElementCreated = document.getElementById('up-arrow');

        if (!!arrowDownElementCreated || !!arrowUpElementCreated) {
            return;
        }

        const arrowsTemplate = document.createElement('template');
        arrowsTemplate.innerHTML = `
    <svg class="arrow downArrow" id="down-arrow" data-testid="down-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <g id="icon/standard/chevron-down-sml">
          <path id="Chevron-down" d="M7 10L12 15L17 10" stroke="#51247A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
      </g>
    </svg>
    <svg class="arrow upArrow" id="up-arrow" data-testid="up-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M17 14L12 9L7 14" stroke="#19151C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;

        !!arrowsTemplate && userNameAreaButtonLocal.prepend(arrowsTemplate.content.cloneNode(true));
    }

    private getDesiredUserDisplayName = () => {
        // find the element it is using to store the full user name (which it shows on a mouse over)
        const userNameAreaLoggedInButton = document.querySelector('nde-user-area button.user-area-logged-in');
        const nameId = userNameAreaLoggedInButton?.getAttribute('aria-describedby');
        const nameIdForcedToString = nameId + '';
        const nameElement = !!nameId && document.getElementById(nameIdForcedToString);
        const desiredDisplayName = !!nameElement && nameElement.textContent;
        return desiredDisplayName;
    }

    // preattach the logged out button. We then hide it with css while they are logged in
    private attachLoggedoutButtonContents = () => {
        const loggedoutButtonContent = document.getElementById('loggedout')
        if (!!loggedoutButtonContent) {
            return;
        }

        const loginButton = document.querySelector('nde-user-area button[aria-label="Open actions menu"]');
        const loggedoutButtonContentTemplate = document.createElement('template');
        loggedoutButtonContentTemplate.innerHTML = `
        <span class="loggedout auth-log-in-label" data-testid="auth-button-login-label">Log in</span>
        <svg id="loggedout" class="uqauth loggedout" width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <g>
                <path d="M9 1C11.2222 1 13 2.77778 13 5C13 7.22222 11.2222 9 9 9C6.77778 9 5 7.22222 5 5C5 2.77778 6.77778 1 9 1Z" stroke="#51247A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M1.59998 18.5714C1.59998 14.4684 4.91614 11.1522 9.01919 11.1522C13.1222 11.1522 16.4384 14.4684 16.4384 18.5714" stroke="#51247A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
        </svg>`;
        !!loggedoutButtonContentTemplate && !!loginButton && loginButton.appendChild(loggedoutButtonContentTemplate.content.cloneNode(true));
    }
}
