#! /bin/bash
#
# checkout all submodules to their desired 'HEAD' bleeding edge revision: MASTER for most.
#

pushd $(dirname $0)                                                                                     2> /dev/null  > /dev/null

cd ..
#git submodule foreach --recursive git checkout master
#
# instead, use the shell to loop through the submodules so we can give any checkout errors the birdy!
for f in $( git submodule foreach --recursive --quiet pwd ) ; do
    echo submodule: $f
    pushd $f                                                                                            2> /dev/null  > /dev/null
    git checkout master
    popd                                                                                                2> /dev/null  > /dev/null
done

# args: lib localname remote
function checkout_branch {
    echo submodule: $1, branch: $2
    pushd $1                                                                                            2> /dev/null  > /dev/null
    git branch --track $2 $3                                                                            2> /dev/null
    git checkout $2
    popd                                                                                                2> /dev/null  > /dev/null
}

checkout_branch lib/backbone                        gh-pages origin/gh-pages
checkout_branch lib/backbone-fundamentals-book      gh-pages origin/gh-pages
checkout_branch lib/Bootstrap-Form-Builder          gh-pages origin/gh-pages
checkout_branch lib/crossfilter                     gh-pages origin/gh-pages
checkout_branch lib/d3                              all_scales_have_subticks origin/all_scales_have_subticks
checkout_branch lib/dropin-require                  gh-pages origin/gh-pages
checkout_branch lib/elFinder                        2.x origin/2.x
checkout_branch lib/iscroll                         v5 origin/v5
checkout_branch lib/jasmine/pages                   gh-pages origin/gh-pages
checkout_branch lib/jquery-dirtyforms/lib/facebox   cssified origin/cssified
checkout_branch lib/jquery-facebox                  cssified origin/cssified
checkout_branch lib/jquery-form-accordion           gh-pages origin/gh-pages
checkout_branch lib/json3/vendor/spec               gh-pages origin/gh-pages
checkout_branch lib/spin                            gh-pages origin/gh-pages
checkout_branch php/lib/PHPExcel                    develop origin/develop
checkout_branch util/javascriptlint                 working-rev origin/working-rev
checkout_branch util/jison/gh-pages                 gh-pages origin/gh-pages
checkout_branch util/jsbeautifier                   gh-pages origin/gh-pages


popd                                                                                                    2> /dev/null  > /dev/null

