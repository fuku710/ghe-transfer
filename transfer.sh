#!/bin/bash

SOURCE_REPO_URL=$1
TARGET_REPO_URL=$2
SOURCE_REPO_NAME=$3

git clone $SOURCE_REPO_URL --bare
cd $SOURCE_REPO_NAME
git remote add target $TARGET_REPO_URL
git push target --mirror
cd ..
rm -rf $SOURCE_REPO_NAME