#!/bin/sh

# exit if command returns error (non-zero status)
set -e

if [ "$#" -lt 1 ]; then
    printf "\e[31m\e[1mError:\e[0m\e[31m View name (e.g.: 61UQ_APPDEV) not specified.\e[0m\n"
    printf "Exiting...\n\n"
    exit 1
fi

# Read arguments
PRIMO_VIEW="$1"

cd ./src

echo "Minifying src/custom.js into view_package/js/custom.js"
rm -rf view_package/js/custom.js
uglifyjs custom.js -c -m -o view_package/js/custom.js

echo "Building src/$1.zip from src/view_package/"

rm -rf ./$1 ./$1.zip
cp -r ./view_package ./$1
npx bestzip $1.zip $1/

echo " "
echo "File $1.zip saved in file://$PWD"

printf "\nCleaning up...  "
rm -rf $1

printf "\e[92mDone.\e[0m\n\n"
