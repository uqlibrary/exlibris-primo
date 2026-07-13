import {Component} from '@angular/core';

@Component({
  selector: 'custom-nde-account-info-links-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-account-info-links-custom.component.html',
  styleUrl: './nde-account-info-links-custom.component.scss'
})
export class NdeAccountInfoLinksCustomComponent {
    ngOnInit(): void {
        setInterval(() => {
            // no clearInterval - we have to keep watching to insert it, as primo clears it as the account tabs change :(
            this.addLinksToLoans();
            this.addLinksToRequests();
            this.addLinksToFinesAndCharges();
            this.addLinksToSettings();
        }, 100);
    }

    private addLinksToSettings() {
        const linkType = 'settings';
        const parentElement = 'nde-personal-info';
        const displayLinks = [
            {
                url: 'https://web.library.uq.edu.au/find-and-borrow/library-memberships',
                title: 'Update your details',
            }, {
                url: 'https://guides.library.uq.edu.au/how-to-find/using-library-search/save-options-and-alerts#s-lg-box-22848997',
                title: 'Information on search history',
            }
        ];

        this.addLinksToComponent(parentElement, linkType, displayLinks);
    }
    private addLinksToFinesAndCharges() {
        const linkType = 'fines';
        const parentElement = 'nde-fines';
        const displayLinks = [
            {
                url: 'https://web.library.uq.edu.au/find-and-borrow/borrow-library/borrowing-rules-and-charges#overdue',
                title: 'About overdue charges',
            }
        ];

        this.addLinksToComponent(parentElement, linkType, displayLinks);
    }
    private addLinksToLoans() {
        const linkType = 'loan';
        const parentElement = 'nde-loans';
        const displayLinks = [
            {
                url: 'https://web.library.uq.edu.au/find-and-borrow/borrow-library',
                title: 'Help for loans, renewing, recalls, and returns',
            }
        ];

        this.addLinksToComponent(parentElement, linkType, displayLinks);
    }

    private addLinksToRequests() {
        const linkType = 'request';
        const parentElement = 'nde-requests-page';
        const displayLinks = [
            {
                url: 'https://web.library.uq.edu.au/find-and-borrow/request-items',
                title: 'Help for requests',
            }, {
                url: 'https://auth.library.uq.edu.au/login?relais_return=1',
                title: 'Document Delivery Portal',
            }
        ];

        this.addLinksToComponent(parentElement, linkType, displayLinks);
    }

    private addLinksToComponent = (parentElement: string, linkType: string, displayLinks: { url: string; title: string }[]) => {
        const parentPresent = document.querySelector(parentElement);
        const alreadyDisplayed = document.getElementById(`${linkType}-links`);
        if (!parentPresent || !!alreadyDisplayed) {
            return;
        }

        let html = `<div id="${linkType}-links" class="stackable-links stackable-links-${linkType}" data-testid="stackable-links-${linkType}">`
        displayLinks?.forEach(link => {
            html += this.createLink(link, linkType);
        })
        html += '</div>';
        const template = document.createElement('template');
        template.innerHTML = html;
        const sibling = document.querySelector(`${parentElement} > div:nth-child(2)`);
        !!sibling && sibling.before(template.content.cloneNode(true));
    }

    private createLink(displayLink: any, linkType: string = 'account') {
        return `<a href="${displayLink.url}" target="_blank" aria-labelledby="${linkType}-0" class="button-as-link button-external-link inline-button md-button md-primoExplore-theme stackable-link-entry">
    <span id="${linkType}-0">${displayLink.title}</span>
    <mat-icon _ngcontent-ng-${linkType}="" role="img" class="mat-icon notranslate ${linkType}-indication mat-icon-no-color ng-star-inserted" aria-hidden="true" data-mat-icon-type="svg" data-mat-icon-name="dueAlert">
        <svg id="open-in-new_cache36" width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path>
        </svg>
    </mat-icon>
</a>`
    }

}
