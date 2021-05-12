#!/bin/sh

# exit if command returns error (non-zero status)
set -e

if [ "$#" -lt 1 ]; then
    printf "\e[31m\e[1mError:\e[0m\e[31m View name (e.g.: 61UQ_DEV) not specified.\e[0m\n"
    printf "Exiting...\n\n"
    exit 1
fi

# Read arguments
PRIMO_VIEW="$1"

echo "Will build src/$1.zip from src/view_package/"
echo "  Note 1: Any existing file at the destination will be overwritten."
echo "  Note 2: Any existing files under ./src/$1/ will be deleted."
echo " "

read -p "Press Enter to continue to Ctrl+C to abort..." FAKEINPUT
echo " "

cd ./src
rm -rf ./$1 ./$1.zip
cp -r ./view_package ./$1
npx bestzip $1.zip $1/

echo " "
echo "File $1.zip saved in file://$PWD"

printf "\nCleaning up...  "
rm -rf $1

printf "\e[92mDone.\e[0m\n\n"
