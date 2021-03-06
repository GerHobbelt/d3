#! /bin/bash
#
# Generated by the utility: ../../../util/collect_git_checked_out_branch_recusively.sh --recursive
#
# Checkout each git repository to the given branch/commit or list them
#

mode=h;
while getopts ":hlc" opt ; do
  #echo opt+arg = "$opt$OPTARG"
  case "$opt$OPTARG" in
  l )
    mode=h;
    ;;

  c )
    mode=c;
    ;;

  r )
    mode=r;
    ;;

  * )
    cat <<EOH
checkout_to_known_git_branches_recursive.sh options

Options:

-h      : print this help 
-l      : LIST the branch/commit for each git repository (directory) registered in this script.
-c      : CHECKOUT each git repository to the BRANCH registered in this script.
-r      : CHECKOUT/REVERT each git repository to the COMMIT registered in this script.

Note:

Use the '-r' option to set each repository to an exact commit position, which is useful if,
for instance, you wish to reproduce this registered previous software state (which may 
represent a software release) which you wish to analyze/debug.

EOH
    exit 1;
    ;;
  esac
done

if test "$mode" = "h" ; then
  cat <<EOH

Git repository directory                    :: commit hash                         / branch name
--------------------------------------------::--------------------------------------------------
EOH
fi



# args: DIR COMMIT [BRANCH]
git_repo_checkout_branch() {
  if test "$mode" = "c" || test "$mode" = "r" ; then
    if test -d "$1" ; then
      pushd "$1"                                                               2> /dev/null  > /dev/null
      if test "$mode" = "c" && test -n "$3" ; then
        # make sure the branch is created locally and is a tracking branch:
        git branch --track "$3" "remotes/origin/$3"                            2> /dev/null  > /dev/null
        git checkout "$3"
      else
        git checkout "$2"
      fi
      popd                                                                     2> /dev/null  > /dev/null
    fi
  else
    if test -d "$1" ; then
      printf "%-43s :: %s / %s\n" "$1" "$2" "$3"
    else
      printf "%-43s :: %s / %s\n" "[DIRECTORY DOES NOT EXIST!] $1" "$2" "$3"
    fi
  fi
}


#
# Make sure we switch to the utility directory as all the relative paths for the repositories
# are based off that path!
#
pushd $(dirname $0)                                                            2> /dev/null  > /dev/null



#
# The registered repositories:
#

git_repo_checkout_branch "../documentation/wiki" 3e1057322fa624bd3a9f443e9f2533b7af83e682 master
git_repo_checkout_branch "../documentation/wiki-vanilla" 5dbfb9d3db2a5994a762e5f4d5810adfcc61e3a4 master

# --- all done ---

popd                                                                           2> /dev/null  > /dev/null

