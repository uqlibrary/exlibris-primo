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
echo "Removing old zip file"
rm -rf ./61UQ_INST-$PRIMO_VIEW ./61UQ_INST-$PRIMO_VIEW.zip
cp -r ./VIEW_CODE ./61UQ_INST-$PRIMO_VIEW
npx bestzip 61UQ_INST-$PRIMO_VIEW.zip 61UQ_INST-$PRIMO_VIEW/

echo " "
echo "File 61UQ_INST-$PRIMO_VIEW.zip saved in $PWD"

printf "\nCleaning up...  "
rm -rf 61UQ_INST-$PRIMO_VIEW

printf "\e[92mDone.\e[0m\n\n"
