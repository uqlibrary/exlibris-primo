# PRIMO2 Customisations

- New Primo UI URL: [master](https://search.library.uq.edu.au/primo-explore/search?vid=61UQ_DEV) / [production](https://search.library.uq.edu.au/primo-explore/search?vid=61UQ)

UQ Library is a Hosted Multi-Tenant Customer of Ex Libris (the alternative is to be an On-Premises Customer).

## Theming for new Primo UI includes:

- customisation package `/view_package/*` - [readme](https://github.com/uqlibrary/uqlibrary-reusable-components/blob/master/applications/primo2/view_package/README.md)
- `load.js` - any custom scripts
- `custom.scss` - compiles styles from `/www/*` (Primo's SCSS package) and customisations in `/styles-imports/*`

## Styling guidelines


- all global overrides (eg fonts, colours, etc) to be updated in Primo's SASS package
  - `/www/styles/main.scss` - contains a list of SCSS imports
  - any global overrides of a partial to be copied to `styles-imports/www` (variables example below):
    - global variables(colours) override is imported from `@import "../../styles-imports/www/variables";` 
    - original variables import is kept in the `main.scss` for reference `//@import "partials/variables";`
  - keep overrides to a minimum
- all local customisations/fixes to be done in `reusable-components/applications/primo2/custom-styles.scss`
- SASS package can be downloaded from https://search.library.uq.edu.au/primo-explore/lib/scsss.tar.gz 
- SASS package for SandBox (pre-release) can be downloaded from https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/lib/scsss.tar.gz
- when ExLibris deployes a new release to Primo Sand Box (2-3 weeks before going to production):
  - in primo-sand-box branch: update SASS package to use latest from Primo Sand Box, might require a merge of overrides
  - test/verify customisations are not broken
- new SASS package to be merged with any styling customisations

## Primo sand box

New Primo UI is in active development. All releases are scheduled by ExLibris and are available in Primo Sand Box a couple of weeks before going to production.
* New Primo UI SB 61UQ_DEV view is configured/customised with uqlibrary-reusable-components#primo-sand-box
* Merge uqlibrary-reusable-components#primo-sand-box into master VERY CAREFULLY (view_package contents are referencing sandbox assets - ALWAYS check the branchName value is correct (matches the current branch) in view_package/js/custom.js before pushing)
* [Primo SB BO](https://uq-edu-primo-sb.hosted.exlibrisgroup.com:1443/primo_publishing/admin/acegilogin.jsp)
* [Primo SB 61UQ_DEV](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?sortby=rank&vid=61UQ_DEV)
* [Primo SB Default View](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?sortby=rank&vid=61UQ_DEV_LOGIN)

## Primo release notes/dev notes

- ExLibris Primo release notes [here](https://knowledge.exlibrisgroup.com/Primo/Release_Notes)
- Community Primo dev notes [here](https://docs.google.com/document/d/1pfhN1LZSuV6ZOZ7REldKYH7TR1Cc4BUzTMdNHwH5Bkc/edit#)
- Community Primo cookbook notes [here](https://docs.google.com/document/d/1z1D5II6rhRd2Q01Uqpb_1v6OEFv_OksujEZ-htNJ0rw/edit#heading=h.ti1szv6s9yu0)

## Alma skin customisation

some items in Primo UI are embedded from Alma as iframes and styling has to be applied to Alma skin in Alma back office (see Primo's notes)
Alma skin/css has been customised, but there's not way currently to run Alma current/new skin in parallel (one possible solution is to create a new Alma skin just for a new Primo UI, have a separate view in Primo for a new Primo UI and apply new skin to new Primo view - too much overhead for a little benefit)

*Solution (as discussed with SvG): wait until new Primo UI is production live and old Primo UI is not in use anymore and update the skin for new UI only.*

## Miscellaneous

To make a link that forces login, prepend the link with:

https://search.library.uq.edu.au/primo-explore/login?vid=61UQ&targetURL=...

eg [Link to Saved Items](https://search.library.uq.edu.au/primo-explore/login?vid=61UQ&targetURL=https%3A%2F%2Fsearch.library.uq.edu.au%2Fprimo-explore%2Ffavorites%3Fvid%3D61UQ%26lang%3Den_US%C2%A7ion%3Ditems)

## Developing

Stacey is likely to ask for various changes to be done in various environments.

There are 6 basic environments:

- prod - live, public primo at [search.library.uq.edu.au](https://search.library.uq.edu.au/primo-explore/search?vid=61UQ&sortby=rank) branch is `production`
- prod-dev - development on the live server [search.library.uq.edu.au with vid=61UQ_DEV](https://search.library.uq.edu.au/primo-explore/search?sortby=rank&vid=61UQ_DEV) branch is `primo-prod-dev`
- prod-otb - [Blue out of the box primo in the prod environment](https://search.library.uq.edu.au/primo-explore/search?sortby=rank&vid=61UQ_DEV_LOGIN) - it would be very unusual for us to make changes to this
- sandbox - sandbox area, [uq-edu-primo-sb.hosted.exlibrisgroup.com](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?vid=61UQ&sortby=rank) branch is `primo-sand-box`
- sandbox-dev - sandbox dev area [uq-edu-primo-sb.hosted.exlibrisgroup.com with vid=61UQ_DEV](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?vid=61UQ_DEV&sortby=rank) branch is `primo-sand-box-dev`
- sandbox-otb - sandbox out of the box [uq-edu-primo-sb.hosted.exlibrisgroup.com with vid=61UQ_DEV_LOGIN](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?vid=61UQ_DEV_LOGIN&sortby=rank) - it would be very unusual for us to make changes to this

The branch is set in [applications/primo2/view_package/custom.js](https://github.com/uqlibrary/uqlibrary-reusable-components/blob/master/applications/primo2/view_package/js/custom.js) - [more info](https://github.com/uqlibrary/uqlibrary-reusable-components/blob/master/applications/primo2/view_package/README.md)

### Workflow

Stacey sometimes asks for different changes in different environments so she can demonstrate the differences to WAG (Web Advisory Group). This may mean changes to the package that gets uploaded to Primo or it may mean changes to the js & css that is called from assets.library.uq.edu.au, or both.

Here is a workflow that covers both of these:

- start by making sure the branch you are altering is up to date:
  - merge master into the branch eg primo-sand-box-dev
  - correct branch name to match current branch name in applications/primo2/view_package/js/custom.js & commit
- do development:
  - make changes
  - [upload package](https://github.com/uqlibrary/uqlibrary-reusable-components/blob/master/applications/primo2/view_package/README.md) to back office if an angular change
  - push to github if an assets.library element changes (and also at appropriate times to record any angular changes)
- eventually, get acceptance from stacey that she wants it live - now you need to put any changes to the primo package in the 3 other environments, so they all match
- for each of the 3 other branches (where there is an change to the primo package):
  - merge in, preferably from master
  - change the branch name in custom.js
  - recommit
  - upload the package (if angular changes involved)
  - and push (to make a polymer changes live, or to store an angular change)

Its very tedious and involves a lot of changing the branch name back and forth :(

*Key Item!!*: always make sure to commit the correct branch name in custom/custom.js before you push to github!!!!
  
