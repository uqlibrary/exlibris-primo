/*
 * This file is uploaded as custom.js to env 61UQ_DEV on prod
 * In 2023 61UQ_DEV was the prod-dev environment but was accidentally exposed to users
 * We created a new prod-dev, 61UQ_APPDEV, but left the old one with this redirect to PROD
 * 61UQ_DEV *only* needs this redirect
 * if you need to do something to it:
 * - make your changes below
 * - overwrite the contents of custom.js with your changed code
 * - do the normal viewzip-primo-upload thing
 * - revert the custom.js changes (don't commit the below into custom.js)
 * - commit changes to this file
 */

// redirect the old 61UQ_DEV environment to prod so users with bookmarks end up in prod
const urlParams = new URLSearchParams(window.location.search);
const vidParam = urlParams.get('vid');
if (vidParam === '61UQ_DEV') {
    const newUrl = window.location.href.replace(vidParam, '61UQ');
    window.location.replace(newUrl);
}