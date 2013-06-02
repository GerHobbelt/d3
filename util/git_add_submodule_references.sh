#! /bin/bash
#
# http://stackoverflow.com/questions/3336995/git-will-not-init-sync-update-new-submodules

pushd $(dirname $0)       2> /dev/null
cd ..


git submodule add  git://github.com/mbostock/d3.wiki.git     documentation/wiki-vanilla
git submodule add  git@github.com:GerHobbelt/d3.wiki.git     documentation/wiki


popd       2> /dev/null

