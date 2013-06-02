#! /bin/bash
#
# checkout all submodules to their desired 'HEAD' bleeding edge revision: MASTER for most.
#

pushd $(dirname $0)                 2> /dev/null

cd ..
#git submodule foreach --recursive git checkout master
#
# instead, use the shell to loop through the submodules so we can give any checkout errors the birdy!
for f in $( git submodule foreach --recursive --quiet pwd ) ; do
    echo submodule: $f
    pushd $f                        2> /dev/null
    git checkout master
    popd                            2> /dev/null
done

#pushd documentation/wiki            2> /dev/null
#    git branch --track gh-pages origin/gh-pages                        2> /dev/null
#    git checkout gh-pages
#popd                                2> /dev/null

popd                                2> /dev/null

