# PRIMO Customisations

UQ Library is a Hosted Multi-Tenant Customer of Ex Libris (the alternative is to be an On-Premises Customer).

Primo is managed by the Library's "Discovery and Access Coordinator", referred to below as DAC. This is currently Stacey van Groll.

For security reasons, a description of our environments has been moved [here](https://uq.sharepoint.com/:w:/r/teams/lbf4g4a1/LTSDevelopers%20Documents/Applications/Ex%20Libris%20-%20Primo%20-%20Alma/Environments.docx?d=w9ada68747c4d4752963bdff4b5b8236a&csf=1&web=1&e=BJX8hs)

Primo UI is in active development. All releases are scheduled by Ex Libris and are available in Primo Sand Box a couple of weeks before going to production.

(note: environment 61UQ_APPDEV used to be known as 61UQ_DEV. if you find any remaining refs to 61UQ_DEV, it's just an oversight that should be corrected.)

## Theming for new Primo UI

Styling of primo pages is in the reusable repo at uqlibrary/reusable-webcomponents - see the src/applications/primo folder

* Customisation package `view_package/*` - [readme](https://github.com/uqlibrary/exlibris-primo/blob/master/src/view_package/README.md)

Styling of the Primo GetIt iframe, via the Alma mashup, is maintained in this repo. See below.

[Primo SandBox Back Office](https://uq-edu-primo-sb.hosted.exlibrisgroup.com:1443/primo_publishing/admin/acegilogin.jsp)

## Primo release notes/dev notes

* [Ex Libris Primo release notes](https://knowledge.exlibrisgroup.com/Primo/Release_Notes)
* [Community Primo dev notes](https://docs.google.com/document/d/1pfhN1LZSuV6ZOZ7REldKYH7TR1Cc4BUzTMdNHwH5Bkc/edit#)
* [Community Primo cookbook notes](https://docs.google.com/document/d/1z1D5II6rhRd2Q01Uqpb_1v6OEFv_OksujEZ-htNJ0rw/edit#heading=h.ti1szv6s9yu0)

## Development Workflow

DAC sometimes asks for different changes in different environments (see table, above) so AGDA (Action Group on Discovery and Access) can compare the differences. For example she may want Change A in primo-sandbox-dev and Change B in primo-prod-dev.

You might change the package that gets uploaded to Primo if it is angular changes (this repo) or you might change the js & css that is called from assets.library.uq.edu.au (repo reusable-webcomponents), or both.

Here is a workflow that covers both of these:

* Start by making sure the branch you are altering is up to date:
  * Merge master into the branch eg `primo-sandbox-dev`
* Do development:
  * Make changes
  * [Upload package](https://github.com/uqlibrary/exlibris-primo/blob/master/src/view_package/README.md) to back office if an angular change
    * You can run `npm run viewzip <viewname>` where `<viewname>` is `61UQ`, `61UQ_APPDEV` or `61UQ_DAC` to create the zipfile
* Eventually, get acceptance from DAC that she wants it live - now you need to put any changes to the primo package in the 3 other environments, so they all match
* For each of the 3 other branches (where there is a change to the primo package):
  * Merge in, preferably from master
  * Recommit
  * if angular changes involved, [Zip](https://github.com/uqlibrary/exlibris-primo/blob/master/src/view_package/README.md) and Upload the package
  * Commit & Push (to store an angular change)

### Deployment

Branch summary:

- branch primo-sandbox, deploy to
  - sandbox 61UQ
  - sandbox 61UQ_DAC
  - sandbox 61UQ_CANARY
- branch primo-sandbox-dev, deploy to
  - sandbox 61UQ_APPDEV
- branch primo-prod-dev, deploy to
  - prod 61UQ_APPDEV
- branch production, deploy to
  - prod 61UQ 
  - prod 61UQ_DAC

so merge your change to each branch, push, the build the zip and deploy

## Alma Styling

See [the alma readme](https://github.com/uqlibrary/exlibris-primo/blob/master/src/alma/README.md)

## Miscellaneous

1. To make a link that forces login, prepend the link with:

    <https://search.library.uq.edu.au/discovery/login?vid=61UQ&targetURL=...>

    e.g.: [Link to Saved Items](https://search.library.uq.edu.au/discovery/login?vid=61UQ&targetURL=https%3A%2F%2Fsearch.library.uq.edu.au%2Fdiscovery%2Ffavorites%3Fvid%3D61UQ%26lang%3Den_US%C2%A7ion%3Ditems)

2. [This repo](https://github.com/mehmetc/primo-extract) may be useful if we ever have to get into the depths of Primo Angular - it gives access to the sourcemaps of Primo Angular code.
