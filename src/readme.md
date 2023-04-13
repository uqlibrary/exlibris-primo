# PRIMO Customisations

UQ Library is a Hosted Multi-Tenant Customer of Ex Libris (the alternative is to be an On-Premises Customer).

Primo is managed by the Library's "Discovery and Access Coordinator", referred to below as DAC. This is currently Stacey van Groll.

There are 6 basic environments:

| Primo Environment Name | Primo Url        | Git&nbsp;Branch&nbsp;Name  | Notes |
| ---------------------- | ---------------- | --------------- | ---- |
| prod | [search.library.uq.edu.au](https://search.library.uq.edu.au/primo-explore/search?vid=61UQ&sortby=rank) (ie vid=61UQ) | `production` | live, public primo |
| prod-dev | [search.library.uq.edu.au](https://search.library.uq.edu.au/primo-explore/search?sortby=rank&vid=61UQ_DEV) (ie vid=61UQ_DEV) | `primo-prod-dev` | development on the live server |
| prod-dac | [search.library.uq.edu.au](https://search.library.uq.edu.au/primo-explore/search?sortby=rank&vid=61UQ_DAC) (ie vid=61UQ_DAC) | (uses prod) | DAC's personal area. Keep it up to date with the others - deploy prod-dev changes here |
| prod-otb | [search.library.uq.edu.au](https://search.library.uq.edu.au/primo-explore/search?sortby=rank&vid=61UQ_DEV_LOGIN) (ie vid=61UQ_DEV_LOGIN) | - | Blue out of the box primo in the prod environment - it would be very unusual for us to make changes to this |
| sandbox | [uq-edu-primo-sb.hosted.exlibrisgroup.com](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?vid=61UQ&sortby=rank) (ie vid=61UQ) | `primo-sandbox` | sandbox area |
| sandbox-dev | [uq-edu-primo-sb.hosted.exlibrisgroup.com](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?vid=61UQ_DEV&sortby=rank) (ie vid=61UQ_DEV) | `primo-sandbox-dev` | sandbox dev area |
| sandbox-dac | [uq-edu-primo-sb.hosted.exlibrisgroup.com](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?vid=61UQ_DAC&sortby=rank) (ie vid=61UQ_DAC) | (uses primo-sandbox) | DAC's personal area. Keep it up to date with the others - deploy sandbox-dev changes here |
| sandbox-otb | [uq-edu-primo-sb.hosted.exlibrisgroup.com](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/primo-explore/search?vid=61UQ_DEV_LOGIN&sortby=rank) (ie vid=61UQ_DEV_LOGIN) | - | sandbox out of the box - it would be very unusual for us to make changes to this |

The branch is set in [view_package/custom.js](https://github.com/uqlibrary/exlibris-primo/blob/master/src/view_package/js/custom.js) (down the bottom, look for `insertScript`)

Primo UI is in active development. All releases are scheduled by Ex Libris and are available in Primo Sand Box a couple of weeks before going to production.

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
    * You can run `npm run viewzip <viewname>` where `<viewname>` is `61UQ`, `61UQ_DEV` or `61UQ_DAC` to create the zipfile
* Eventually, get acceptance from DAC that she wants it live - now you need to put any changes to the primo package in the 3 other environments, so they all match
* For each of the 3 other branches (where there is an change to the primo package):
  * Merge in, preferably from master
  * Recommit
  * if angular changes involved, [Zip](https://github.com/uqlibrary/exlibris-primo/blob/master/src/view_package/README.md) and Upload the package
  * Commit & Push (to store an angular change)

## Alma Styling

See [the alma readme](https://github.com/uqlibrary/exlibris-primo/blob/master/src/alma/README.md)

## Miscellaneous

1. To make a link that forces login, prepend the link with:

    <https://search.library.uq.edu.au/primo-explore/login?vid=61UQ&targetURL=...>

    e.g.: [Link to Saved Items](https://search.library.uq.edu.au/primo-explore/login?vid=61UQ&targetURL=https%3A%2F%2Fsearch.library.uq.edu.au%2Fprimo-explore%2Ffavorites%3Fvid%3D61UQ%26lang%3Den_US%C2%A7ion%3Ditems)

2. [This repo](https://github.com/mehmetc/primo-extract) may be useful if we ever have to get into the depths of Primo Angular - it gives access to the sourcemaps of Primo Angular code.
