import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'custom-nde-replace-user-initials-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-replace-user-initials-custom.component.html',
  styleUrl: './nde-replace-user-initials-custom.component.scss'
})
export class NdeReplaceUserInitialsCustomComponent implements OnInit {
  ngOnInit(): void {


    const awaitLogin = setInterval(() => {
      // find the 'user is logged in' button on the screen (OTB it shows initials, backwards)
      const userNameAreaButton = document.querySelector('nde-user-area button');

      // figure out what other element it is using to store the full user name (which it shows on a mouse over)
      const nameId = userNameAreaButton?.getAttribute('aria-describedby');
      let nameIdForcedToString = nameId + '';
      const nameElement = !!nameId && document.getElementById(nameIdForcedToString);

      // get the user's full name from that hover text element
      const displayName = !!nameElement && nameElement.textContent;

      // find the element where the name should appear
      const displayArea = userNameAreaButton?.querySelector('span.ng-star-inserted');

      const arrowDownElementCreated = document.getElementById('down-arrow');
      const arrowUpElementCreated = document.getElementById('up-arrow');

      if (!displayArea || !displayName) {
        console.log('nope');
        // delete the arrows if they exist, so we can reinsert them in the right place
        !!arrowDownElementCreated && arrowDownElementCreated.remove();
        !!arrowUpElementCreated && arrowUpElementCreated.remove();

        const buttonRewritten = document.getElementById('auth-button-login-label');
        if (!buttonRewritten) {
          const loggedOutTemplate = document.createElement('template');
          loggedOutTemplate.innerHTML = ` <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                        <g>
                            <path d="M9 1C11.2222 1 13 2.77778 13 5C13 7.22222 11.2222 9 9 9C6.77778 9 5 7.22222 5 5C5 2.77778 6.77778 1 9 1Z" stroke="#51247A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M1.59998 18.5714C1.59998 14.4684 4.91614 11.1522 9.01919 11.1522C13.1222 11.1522 16.4384 14.4684 16.4384 18.5714" stroke="#51247A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </g>
                    </svg>
                    <span class="auth-log-in-label" id="auth-button-login-label" data-testid="auth-button-login-label">Log in</span>`;

          const loggedoutButton = document.querySelector('[aria-label="Open actions menu"]')
          // get rid of current children
          !!loggedoutButton && (loggedoutButton.innerHTML = '');
          !!loggedOutTemplate && !!loggedoutButton && loggedoutButton.appendChild(loggedOutTemplate.content.cloneNode(true));
        }

        return;
      }

      console.log('USER LOGGED IN!! ')
      // clearInterval(awaitLogin);

      // add some up down arrows for Library-style Account button (appearance controlled with css)
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

      // if they log out and back in, the arrows remain, so we don't need to add them again
      if (!arrowDownElementCreated && !arrowUpElementCreated) {
        !!arrowsTemplate && displayArea.parentNode?.insertBefore(arrowsTemplate.content.cloneNode(true), displayArea.nextSibling);
      }

      // rewrite the login button label so it shows the username
      if (!displayArea?.textContent?.includes(displayName)) {
        displayArea.textContent = displayName;
      }
      !displayArea?.classList.contains('styledUserName') && displayArea.classList.add('styledUserName');
      if (!displayArea.id) {
        displayArea.id = 'usernameArea';
      }

    }, 100);


  }
}
