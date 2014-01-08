#! /bin/bash
#
# generate a shell script which will add all the git projects to the current directory.
#
# Supported links:
#
# - gists
# - bl.ocks.org gists
# - github

pushd $(dirname $0)                                                                                     2> /dev/null  > /dev/null

cat ./git_clone_all_examples.sh ./d3list.html $( find ../documentation -type f -name '*.md' -o -name '*.htm' -o -name '*.html' ) > tmp1.bak
cat tmp1.bak | sed -e 's/[^a-zA-Z0-9:\/\\._-]/\n/g' > tmp2.bak
cat tmp2.bak | sort -f | uniq > tmp3.bak
cat tmp3.bak | gawk -f ./generate_git_fetch_script.awk > ./git_clone_all_examples.sh

# and update the gitignore file too:
find . -type d -maxdepth 1 -printf "%f/\n"  >> .gitignore
grep -e "^git_add" ./git_clone_all_examples.sh | sed -e "s/^.*https:\/\/[^ ]\+ \+\([^ ]\+\)/\1\//g"  >> .gitignore
cat .gitignore | grep -e "^\.\/$" -v | sort -f | uniq > .gitignore.bak
cat .gitignore.bak > .gitignore

popd                                                                                                    2> /dev/null  > /dev/null
