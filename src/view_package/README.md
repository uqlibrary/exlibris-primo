# The New Primo UI Customization Package

## Package documentation

The development package allows you to configure :

- css
  - no customisation to be done in custom.css
  
- images includes
  - favicon.ico
  - library-logo.png (used in email templates)
  
- html
  - home-en_US.html landing page to contain NO elements (means no paragraphs on home page)
  - email_en_US.html template for emails

- JavaScript
  - reusable components are injected by custom.js

Modifications should always be done in reusable-components/applications/primo2/*.(scss|js) in preference to modifying the package. (Not always possible)

Exceptions:

- initial reusable injection
- email template customisation

## Package deployment

- 'view_package' directory should be renamed to a name of desired view (eg 61UQ for production view, 61UQ_DEV for development, etc) eg.

  `$ cp -r ~/exlibris-primo/src/view_package/ ~/61UQ_DEV`

- make sure there are no hidden files (eg .idea, .git, etc)
- create a zip named after the Primo view, eg 61UQ_DEV view will have 61UQ_DEV.zip

  `$ zip -r 61UQ_DEV.zip 61UQ_DEV`

- OSX? Also run

  `$ zip -d 61UQ_DEV.zip \*.DS_Store`

  to remove the .DS_Store file, automatically created by the zipping process on mac.

  (You can also use `find . -name ".DS_Store" -print -delete` to remove all .DS_Store files under the current directory before zipping)

- upload zip to Promo BO ([Prod](https://primo-direct-apac.hosted.exlibrisgroup.com:1443/primo_publishing/admin/acegilogin.jsp) or [Sandbox](https://uq-edu-primo-sb.hosted.exlibrisgroup.com:1443/primo_publishing/admin/acegilogin.jsp)) to corresponding view:
  - in menu `Deploy & Utilities -> Customization Manager`  
  - select view, eg 61UQ_DEV
  - upload package for `View Name` - choose and upload zip-file
  - briefly announce to Stacey (or Eric in her absence) that you are about to deploy (Slack will do) for the rare case of conflict (if they arent at their desks then its very unlikely they are deploying) (Around 8am and 8pm each day Prmo will be doing a 'hotswap'
   and deploys will normally fail. Just wait.)
  - once file is uploaded, click the `Deploy` button
  
Note: Customisation Manager allows the upload of _just_ the logo or _just_ the email template. Upload the complete view package in preference.  

## Primo dev environment

Try setting up local environment following this: <https://github.com/ExLibrisGroup/primo-explore-devenv>
