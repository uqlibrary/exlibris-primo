import {
    NdeAccountInfoLinksCustomComponent
} from "../nde-account-info-links-custom/nde-account-info-links-custom.component";
import {NdeReportAProblemCustomComponent} from "../nde-report-a-problem-custom/nde-report-a-problem-custom.component";
import {
    NdeUpdateAccountMenuCustomComponent
} from "../nde-update-account-menu-custom/nde-update-account-menu-custom.component";
import {
    NdeContentIndicatorsOnFullCustomComponent
} from "../nde-content-indicators-on-full-custom/nde-content-indicators-on-full-custom.component";
import {
    NdeContentIndicatorsOnBriefCustomComponent
} from "../nde-content-indicators-on-brief-custom/nde-content-indicators-on-brief-custom.component";
import {NdeCountOfFiltersCustomComponent} from "../nde-count-of-filters-custom/nde-count-of-filters-custom.component";
import {
    NdeServicesPageBannerCustomComponent
} from "../nde-services-page-banner-custom/nde-services-page-banner-custom.component";

export const selectorComponentMap = new Map<string, any>([
    ['nde-account-after', NdeAccountInfoLinksCustomComponent],
    ['nde-full-display-service-container-after', NdeReportAProblemCustomComponent],
    ['nde-user-area-after', NdeUpdateAccountMenuCustomComponent],
    ['nde-full-display-container-after', NdeContentIndicatorsOnFullCustomComponent],
    ['nde-record-indications-after', NdeContentIndicatorsOnBriefCustomComponent],
    ['nde-search-filters-side-nav-after', NdeCountOfFiltersCustomComponent],
    ['nde-record-availability-after', NdeServicesPageBannerCustomComponent],
]);
