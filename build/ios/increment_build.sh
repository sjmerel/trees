#!/bin/bash 

# increment build number for a release build (typically from an Archive build)

set -o nounset
set -o errexit

if [ "$CONFIGURATION" = "Debug" ] 
then
   exit 0
fi

if [ $# -gt 0 ]
then
    plist=$1
else
    plist="$PRODUCT_SETTINGS_PATH"
fi

if [ ! -r "$plist" ]
then
   echo "$plist not found"
   exit 1
fi

function getPlistValue()
{
    key=$1
    fgrep --after-context=1 $key "$plist" | tail -1 | sed 's/.*<string>//g' | sed 's/<\/string>.*//g'
}

# get current build
build=`fgrep --after-context=1 CFBundleVersion "$plist" | tail -1 | sed 's/.*<string>//g' | sed 's/<\/string>.*//g'`
version=`fgrep --after-context=1 CFBundleShortVersionString "$plist" | tail -1 | sed 's/.*<string>//g' | sed 's/<\/string>.*//g'`

# tag it
tag=`echo "$build" | sed 's/ /_/g'`
#git tag --force "${PRODUCT_NAME}-$version-$tag"

if [[ $build =~ ^[0-9]+$ ]] 
then
    # increment
    build=$(( $build + 1 ))
    echo "new build number is $build"

    # set new build
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $build" "$plist"
fi


