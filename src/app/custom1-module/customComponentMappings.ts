import {
    NdeAccountInfoLinksCustomComponent
} from "../nde-account-info-links-custom/nde-account-info-links-custom.component";
import {NdeReportAProblemCustomComponent} from "../nde-report-a-problem-custom/nde-report-a-problem-custom.component";
import {
    NdeUpdateAccountMenuCustomComponent
} from "../nde-update-account-menu-custom/nde-update-account-menu-custom.component";
import {
    NdeContentIndicatorsCustomComponent
} from "../nde-content-indicators-custom/nde-content-indicators-custom.component";
import {NdeCountOfFiltersCustomComponent} from "../nde-count-of-filters-custom/nde-count-of-filters-custom.component";
import {NdeOverrideOutlinkCustomComponent} from "../nde-override-outlink-custom/nde-override-outlink-custom.component";
import {
    NdeServicesPageBannerCustomComponent
} from "../nde-services-page-banner-custom/nde-services-page-banner-custom.component";
import {NdeOptionsButtonCustom} from "../nde-options-button-component/nde-options-button-custom.component";

export const selectorComponentMap = new Map<string, any>([
    ['nde-account-after', NdeAccountInfoLinksCustomComponent],
    ['nde-full-display-service-container-after', NdeReportAProblemCustomComponent],
    ['nde-record-indications-after', NdeContentIndicatorsCustomComponent],
    ['nde-online-availability-after', NdeOverrideOutlinkCustomComponent],
    ['nde-search-filters-side-nav-after', NdeCountOfFiltersCustomComponent],
    ['nde-search-results-container-after', NdeOptionsButtonCustom],
    ['nde-record-availability-after', NdeServicesPageBannerCustomComponent],
    ['nde-user-area-after', NdeUpdateAccountMenuCustomComponent],
]);
