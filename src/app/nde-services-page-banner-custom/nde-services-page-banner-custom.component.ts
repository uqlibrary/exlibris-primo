import { Component } from '@angular/core';

@Component({
  selector: 'custom-nde-services-page-banner-custom',
  standalone: true,
  imports: [],
  templateUrl: './nde-services-page-banner-custom.component.html',
  styleUrl: './nde-services-page-banner-custom.component.scss'
})
export class NdeServicesPageBannerCustomComponent {
    ngOnInit(): void {
        const isServicePageByUrl = window.location.pathname === '/nde/openurl';

        let showServicesBanner = true

        if (!isServicePageByUrl) {
            // items with this url are loaded from unvetted data and might be... non-optimal
            showServicesBanner = false;
        }

        // &rfr_id=info:sid%252Fprimo.exlibrisgroup.com-bX-Bx
        if (showServicesBanner) {
            // the url says we are on a Services page, but certain types don't show the banner

            const urlParams = new URLSearchParams(window.location.search);
            const rfrIds = urlParams.getAll('rfr_id')
            rfrIds.forEach(rfrid => {
                if (rfrid.endsWith('-Bx') || rfrid.endsWith('-cLinker') || rfrid.endsWith('-talis')) {
                    showServicesBanner = false;
                }
            })
        }

        if (showServicesBanner) {
            // the url says we are on a Services page, but if we have the item in stock, don't show the banner
            const availabilityStatusLine = document.querySelector('.availability-status');
            if (!!availabilityStatusLine && !availabilityStatusLine.classList.contains('no_inventory')) {
                showServicesBanner = false;
            }
        }

        if (showServicesBanner) {
            this.addServicesPageWarningBanner();
        }
    }

    private addServicesPageWarningBanner = () => {
        const servicePageWarningBannerId = "servicePageWarningBanner";
        const displayBlock = document.getElementById(servicePageWarningBannerId);
        if (!!displayBlock) {
            return; // block already exists - don't duplicate
        }

        const displayTextTemplate = document.createElement('template');
        displayTextTemplate.innerHTML = `<div id="${servicePageWarningBannerId}" class="standardWarningBanner standardWarningBanner-servicesPage" data-testid="services-page-banner">` +
            '<div class="uq-icon uq-icon--standard--exclamation-triangle"></div>' +
            '<p>This is an auto-generated page that may include incorrect citation details. Please verify the citation before placing a request. You can <a href="https://www.library.uq.edu.au">search the Library</a>, or <a href="https://web.library.uq.edu.au/about/contact-us">contact us</a> for help.</p>' +
            '</div>';

        const parent = document.querySelector('nde-search-result-item-container');
        !!displayTextTemplate && !!parent && parent.after(displayTextTemplate.content.cloneNode(true));
    }
}
