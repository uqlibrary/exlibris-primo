# The New Primo UI Customization Package

## Package documentation

The development package allows you to configure :

- css
  - no customisation to be done in custom.css
  
- images includes
  - favicon.ico
  - library-logo.png (used in email templates)
  - a whole bunch of small icons that are the default image for the matching type of record in Primo
  
- html/homepage
  - home-en_US.html landing page to contain NO elements (means no paragraphs on home page)
  - email_en_US.html template for emails

- JavaScript
  - reusable components are injected by custom.js

Modifications should always be done in reusable-components/applications/primo/*.(scss|js) in preference to modifying the package. (Not always possible)

Exceptions:

- initial reusable injection
- email template customisation

## Package deployment

The view_package directory must be zipped for upload. We have a npm command for that:

`npm run viewzip 61UQ`, supplying the vid name you require.

As an OSX user, I find it useful to go:

`npm run viewzip 61UQ_APPDEV && zip -d 61UQ_INST-61UQ_APPDEV.zip \*.DS_Store`

Adjust the vid value to the vid you need. The command above will:

- create the zip
- if on osx you will want this, it strips any annoying .ds_store files from the zip

Below are the old manual commands if you prefer to do it that way:

~~- 'view_package' directory should be renamed to a name of desired view (eg 61UQ for production view, 61UQ_APPDEV for development, etc) eg.

  `$ cp -r ~/exlibris-primo/src/view_package/ ~/61UQ_APPDEV`

- make sure there are no hidden files (eg .idea, .git, etc)
- create a zip named after the Primo view, eg 61UQ_APPDEV view will have 61UQ_APPDEV.zip

  `$ zip -r 61UQ_APPDEV.zip 61UQ_INST-61UQ_APPDEV`

- OSX? Also run

  `$ zip -d 61UQ_INST-61UQ_APPDEV.zip \*.DS_Store`

  to remove the .DS_Store file, automatically created by the zipping process on mac.

  (You can also use `find . -name ".DS_Store" -print -delete` to remove all .DS_Store files under the current directory before zipping)~~

### Uploading via interface

Uploading to Alma Back Office is the only way to upload - Ex Libris has never set up a push via github

- upload zip to Alma BO ([Prod](https://uq.alma.exlibrisgroup.com/SAML) or [Sandbox](https://uq-psb.alma.exlibrisgroup.com/infra/action/pageAction.do?xmlFileName=configuration_setup.configuration_mngUXP.xml&almaConfiguration=true&pageViewMode=Edit&pageBean.menuKey=com.exlibris.dps.menu_conf&operation=LOAD&pageBean.helpId=general_configuration&pageBean.currentUrl=xmlFileName%3Dconfiguration_setup.configuration_mngUXP.xml%26almaConfiguration%3Dtrue%26pageViewMode%3DEdit%26pageBean.menuKey%3Dcom.exlibris.dps.menu_conf%26operation%3DLOAD%26pageBean.helpId%3Dgeneral_configuration%26resetPaginationContext%3Dtrue%26showBackButton%3Dfalse&pageBean.navigationBackUrl=..%2Faction%2Fhome.do&resetPaginationContext=true&showBackButton=false&pageBean.securityHashToken=-5853301607516470192)) to corresponding view:
  - choose current location (no idea why!) 
  - in sidebar, bottom left, click `Configuration`  
  - in sidebar, top, click `Discovery`  
  - menu opens, under "Display Configuration", click 'Configure Views'
  - select view, eg 61UQ_APPDEV using right hand button with 3 dots - click 'Edit'
  - click on 'Manage Customization Package' tab
  - if you wish, you can download the "Current View Customization package" as insurance against an undesired change
  - choose "upload package", and click the button with the folder icon to choose the zip file (I like to visually confirm the time stamp on the file before I choose it)
  - click Upload
  - Alma should respond within a second or two with a small "Customization file uploaded successfully" dialog in the top right corner
  - IMPORTANT!! now click "Save" (top right corner)
  - Alma should respond within a second or two with a small "Customization package deployed successfully" dialog (other items too) in the top right corner
  - update is available straight away - you may need to do a hard refresh on the web page to see it
  
## Primo dev environment

Try setting up local environment following this: <https://github.com/ExLibrisGroup/primo-explore-devenv>
