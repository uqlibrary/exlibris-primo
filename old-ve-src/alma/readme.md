## Alma Styling

Parts of the Primo pages are inside iframes, eg the 'Get It' block on the full display page. This means our main reusable-webcomponents custom-styles.css file wont affect it.

Ex Libris provides a css upload that styles inside the iframes. It is found at eg [https://uq-psb.alma.exlibrisgroup.com/view/branding_skin/css/mashup_new.css]

### Workflow

1. Make your changes
    1. Choose your workarea (eg [primo sandbox appdev](https://uq-edu-primo-sb.hosted.exlibrisgroup.com/discovery/search?vid=61UQ_APPDEV&sortby=rank) )
    1. In the inspect panel, under Sources, edit the css source file at Alma "Get It" iframe > uq-psb.alma.exlibrisgroup.com > view > branding_skin > css > mashup_new.css until you are happy with the result, and copy to your local mashup_new.scss file

1. Create the zip for upload

    1. Checkout the appropriate branch
    1. Run `npm run almastyles` to create the .css files from the .scss files (probably worth checking the genrated css works by pasting it back into the inspect window in the browser)
    1. Run `npm run almazip` to create branding_skin.zip, containing the updated file

1. Upload the zip to alma

    1. Login to the Alma back office (links below), then visit the configuration page (click on the Cog) and choose 'General' in the sidebar, look for 'User Interface Settings' heading and then click 'Delivery System Skins'. Check with DAC which skin to update if it is unclear.
    1. Upload the .zip file (there is no rebuild process here)
    1. Reload the primo sandbox page and confirm your changes worked
    1. commit your changes

There are 2 npm commands for this process:

* `npm run almastyles`, will build the .scss file at applications/primo2/alma/branding_skin/css into a .css file
* `npm run almazip`, will build a zip file ready to be uploaded to alma

The upload is done in Alma back office. Paths are:

* [Sandbox Alma Back Office](https://uq-psb.alma.exlibrisgroup.com/mng/action/home.do)
* [Prod Alma Back Office](https://uq.alma.exlibrisgroup.com/SAML)

(if you cant access Alma Back Office Config, ask DAC for access, or she may want to do the upload herself)

