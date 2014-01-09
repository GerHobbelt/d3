#
# GAWK script to extract URI definitions for github / gists repositories.
#


function extract_gist_number(uri, idx,          str, a, gist_nr) {
    # because MSys gawk doesn't support match() with 3 arguments :-((
    str = gensub(/^.*bl\.ocks\.org/, "xxx", 1, uri);
    str = gensub(/^.*gist\.github\.com/, "xxx", 1, str);

    split(str, a, "/");
    gist_nr = a[idx];
    # strip off any trailing cruft:
    gist_nr = gensub(/[^0-9].*$/, "", 1, gist_nr);
    #printf("Selecting Gist URI [%s] for line '%s' '%s'\n", gist_nr, uri, str);
    return gist_nr;
}

function extract_user_and_repo(uri, idx,          str, a, gist_nr) {
    str = gensub(/^.*github\.com/, "xxx", 1, uri);

    split(str, a, "/");
    user = a[idx];
    repo = clean_repo(a[idx + 1]);
    #printf("Selecting Github repo URI [%s/%s] for line '%s' '%s'\n", user, repo, uri, str);
    return user "/" repo;
}

function clean_repo(str,                            s) {
    for (;;) {
        s = gensub(/\.git$/, "", "g", str);
        if (s == str)
            return str;
        str = s;
    }
}

function mk_name(str) {
    str = gensub(/[^a-zA-Z0-9_-]+/, "_", "g", str);
    str = gensub(/_+/, "_", "g", str);
    return str;
}

function push_entry(idx, line, comment_line) {
    stmts[idx] = line;
    comment_stmts[idx] = comment_line;
    #printf("# id %s: '%s' --> '%s'\n", idx, line, stmts[idx]);
}

function push_gist_entry(gist_nr) {
    push_entry("gist-" gist_nr, sprintf("gist_add  %9s", gist_nr), sprintf("https://gist.github.com/%s.git", gist_nr));
}

function push_github_entry(git_repo) {
    push_entry("github-" git_repo, sprintf("github_add  %s", git_repo), sprintf("https://github.com/%s.git", git_repo));
}

BEGIN {
    printf("#! /bin/bash\n");
    printf("# generated by generate_git_fetch_script.sh\n");
    printf("\n");
    printf("pushd $(dirname $0)                                                                                     2> /dev/null   > /dev/null\n");
    printf("\n");
    printf("if ! test -d \"./\\!descriptions\" ; then\n");
    printf("  mkdir \"./\\!descriptions\"\n");
    printf("fi\n");
    printf("pwd\n");
    printf("\n");
    printf("function check_github_api_output {\n");
    printf("    if test -s \"$1\" ; then\n");
    printf("        if $( grep -e \"API rate limit exceeded for \" \"$1\"  2> /dev/null   > /dev/null ) ; then\n");
    printf("            echo \"github API rate limiting detected...\"\n");
    printf("            rm -f \"$1\"\n");
    printf("        fi\n");
    printf("    fi\n");
    printf("}\n");
    printf("\n");
    printf("function gist_add {\n");
    printf("    local full_uri=$( printf \"https://gist.github.com/%%s.git\" \"$1\" );\n");
    printf("    local dir_path=$( printf \"gist-%%s\" \"$1\" );\n");
    printf("    echo \"gist: full_uri = ${full_uri}, dir_path = ${dir_path}\"\n");
    printf("     \n");
    printf("    if test \"$mode\" != \"U\" -a \"$mode\" != \"QU\" ; then\n");
    printf("        if test -s \"${dir_path}/.git/index\" ; then\n");
    printf("            pushd .                                                                                     2> /dev/null   > /dev/null\n");
    printf("            cd ${dir_path}\n");
    printf("            git pull --all\n");
    printf("            popd                                                                                        2> /dev/null   > /dev/null\n");
    printf("        else \n");
    printf("            rm -rf ${dir_path}                                                                          2> /dev/null   > /dev/null\n");
    printf("            echo git clone ${full_uri} ${dir_path}\n");
    printf("            git clone ${full_uri} ${dir_path}\n");
    printf("        fi\n");
    printf("    fi\n");
    printf("    if test \"$mode\" = \"W\" ; then\n");
    printf("        git_register_remote_for_UnixVM ${full_uri} ${dir_path}\n");
    printf("    fi\n");
    printf("\n");
    printf("    check_github_api_output \"./\\!descriptions/${dir_path}.txt\"\n");
    printf("    delay=1\n");
    printf("    while ! test -s \"./\\!descriptions/${dir_path}.txt\" ; do\n");
    printf("        echo curl -o \"./\\!descriptions/${dir_path}.txt\" https://api.github.com/gists/$1 \n");
    printf("        curl -o \"./\\!descriptions/${dir_path}.txt\" https://api.github.com/gists/$1 \n");
    printf("        check_github_api_output \"./\\!descriptions/${dir_path}.txt\"\n");
    printf("        if  ! test -s \"./\\!descriptions/${dir_path}.txt\" ; then\n");
    printf("            echo \"sleep $delay\"\n");
    printf("            sleep $delay\n");
    printf("            delay=$(expr \\( $delay \\< 1000 \\) \\* $delay \\* 2 + \\( $delay \\>= 1000 \\) \\* 1000 )\n");
    printf("        fi\n");
    printf("        if test \"$mode\" = \"QU\" ; then\n");
    printf("            break\n");
    printf("        fi\n");
    printf("    done\n");
    printf("    touch \"./\\!descriptions/${dir_path}.txt\"\n");
    printf("\n");
    printf("    cat \"./\\!descriptions/${dir_path}.txt\" | gawk -f ./git_clone_all_examples.awk -v gist=$1 >> examples_index.html\n");
    printf("}\n");
    printf("\n");
    printf("function github_add {\n");
    printf("    local full_uri=$( printf \"git@github.com:%%s.git\" \"$1\" );\n");
    printf("    local dir_path=$( printf \"github.%%s\" \"$1\" | sed -e \"s/[^a-zA-Z0-9_.-]\\+/./g\" -e \"s/\\.\\+/./g\" );\n");
    printf("    echo \"github: full_uri = ${full_uri}, dir_path = ${dir_path}\"\n");
    printf("     \n");
    printf("    if test \"$mode\" != \"U\" -a \"$mode\" != \"QU\" ; then\n");
    printf("        if test -s \"${dir_path}/.git/index\" ; then\n");
    printf("            pushd .                                                                                     2> /dev/null   > /dev/null\n");
    printf("            cd ${dir_path}\n");
    printf("            git pull --all\n");
    printf("            popd                                                                                        2> /dev/null   > /dev/null\n");
    printf("        else \n");
    printf("            rm -rf ${dir_path}                                                                          2> /dev/null   > /dev/null\n");
    printf("            echo git clone ${full_uri} ${dir_path}\n");
    printf("            git clone ${full_uri} ${dir_path}\n");
    printf("        fi\n");
    printf("    fi\n");
    printf("    if test \"$mode\" = \"W\" ; then\n");
    printf("        git_register_remote_for_UnixVM ${full_uri} ${dir_path}\n");
    printf("    fi\n");
    printf("\n");
    printf("    check_github_api_output \"./\\!descriptions/${dir_path}.txt\"\n");
    printf("    delay=1\n");
    printf("    while ! test -s \"./\\!descriptions/${dir_path}.txt\" ; do\n");
    printf("        echo curl -o \"./\\!descriptions/${dir_path}.txt\" https://api.github.com/repos/$1 \n");
    printf("        curl -o \"./\\!descriptions/${dir_path}.txt\" https://api.github.com/repos/$1 \n");
    printf("        check_github_api_output \"./\\!descriptions/${dir_path}.txt\"\n");
    printf("        if  ! test -s \"./\\!descriptions/${dir_path}.txt\" ; then\n");
    printf("            echo \"sleep $delay\"\n");
    printf("            sleep $delay\n");
    printf("            delay=$(expr \\( $delay \\< 1000 \\) \\* $delay \\* 2 + \\( $delay \\>= 1000 \\) \\* 1000 )\n");
    printf("        fi\n");
    printf("        if test \"$mode\" = \"QU\" ; then\n");
    printf("            break\n");
    printf("        fi\n");
    printf("    done\n");
    printf("    touch \"./\\!descriptions/${dir_path}.txt\"\n");
    printf("\n");
    printf("    cat \"./\\!descriptions/${dir_path}.txt\" | gawk -f ./git_clone_all_examples.awk -v github=$1 >> examples_index.html\n");
    printf("}\n");
    printf("\n");
    printf("\n");
    printf("function git_register_remote_for_UnixVM {\n");
    printf("    if test -d \"$2\" ; then\n");
    printf("        if test -d \"$Win7DEV_BASEDIR/$2\" ; then\n");
    printf("            pushd $2                                                                                    2> /dev/null  > /dev/null\n");
    printf("            git remote remove Win7DEV\n");
    printf("            git remote add Win7DEV $Win7DEV_BASEDIR/$2\n");
    printf("            popd                                                                                        2> /dev/null  > /dev/null\n");
    printf("        fi\n");
    printf("    fi\n");
    printf("}\n");
    printf("\n");
    printf("getopts \":Wufh\" opt\n");
    printf("#echo opt+arg = \"$opt$OPTARG\"\n");
    printf("case \"$opt$OPTARG\" in\n");
    printf("W )\n");
    printf("  echo \"--- registering Win7DEV as remote ---\"\n");
    printf("  mode=\"W\"\n");
    printf("  for (( i=OPTIND; i > 1; i-- )) do\n");
    printf("    shift\n");
    printf("  done\n");
    printf("  #echo args: $@\n");
    printf("  if test -d \"$1\" ; then\n");
    printf("    Win7DEV_BASEDIR=$1\n");
    printf("  fi\n");
    printf("  ;;\n");
    printf("\n");
    printf("u )\n");
    printf("  echo \"--- only updating the index file ---\"\n");
    printf("  mode=\"U\"\n");
    printf("  for (( i=OPTIND; i > 1; i-- )) do\n");
    printf("    shift\n");
    printf("  done\n");
    printf("  #echo args: $@\n");
    printf("  ;;\n");
    printf("\n");
    printf("f )\n");
    printf("  echo \"--- only updating the index file ---\"\n");
    printf("  mode=\"QU\"\n");
    printf("  for (( i=OPTIND; i > 1; i-- )) do\n");
    printf("    shift\n");
    printf("  done\n");
    printf("  #echo args: $@\n");
    printf("  ;;\n");
    printf("\n");
    printf("\"?\" )\n");
    printf("  echo \"--- registering D3 example git repositories ---\"\n");
    printf("  mode=\"R\"\n");
    printf("  ;;\n");
    printf("\n");
    printf("* )\n");
    printf("  cat <<EOT\n");
    printf("$0 [-W <optional_remote_path>]\n");
    printf("\n");
    printf("set up all D3 example git repositories.\n");
    printf("\n");
    printf("-u       : only regenerate/update the index HTML file from the already loaded records\n");
    printf("\n");
    printf("-u       : like '-u' but does retry fetching metadata from github for each repo\n");
    printf("\n");
    printf("-W       : set up 'Win7DEV' remote reference per repository\n");
    printf("\n");
    printf("           When you don't specify the remote path yourself,\n");
    printf("           the default is set to:\n");
    printf("             \"$Win7DEV_BASEDIR\"\n");
    printf("\n");
    printf("EOT\n");
    printf("  exit\n");
    printf("  ;;\n");
    printf("esac\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("echo \"<html><body>\" > examples_index.html\n");
    printf("\n");
    printf("echo \"<h1>D3 example/test gists and git repositories:</h1>\" >> examples_index.html\n");
    printf("echo \"<dl>\" >> examples_index.html\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");

    state = 0;
    idx = 0;
    stmts[0] = "";
    comment_stmts[0] = "";
}



# http://bl.ocks.org/4341417
/bl\.ocks\.org\/[0-9]+$/        {
    gist_nr = extract_gist_number($0, 2);

    push_gist_entry(gist_nr);
    next;
}

# http://bl.ocks.org/4710330/94a7c0aeb6f09d681dbfdd0e5150578e4935c6ae
/bl\.ocks\.org\/[0-9]+\//        {
    gist_nr = extract_gist_number($0, 2);

    push_gist_entry(gist_nr);
    next;
}

# http://bl.ocks.org/mbostock/1005090
/bl\.ocks\.org\/[^\/]+\/[0-9]+$/        {
    gist_nr = extract_gist_number($0, 3);

    push_gist_entry(gist_nr);
    next;
}

# http://bl.ocks.org/mbostock/1005090/
/bl\.ocks\.org\/[^\/]+\/[0-9]+\//        {
    gist_nr = extract_gist_number($0, 3);

    push_gist_entry(gist_nr);
    next;
}

# http://bl.ocks.org/ericcitaire/raw/5408146/thumbnail.png
/bl\.ocks\.org\/[^\/]+\/raw\/[0-9]+\//        {
    gist_nr = extract_gist_number($0, 4);

    push_gist_entry(gist_nr);
    next;
}

# gist.github.com/1005090.git
/gist\.github\.com\/[0-9]+\./        {
    gist_nr = extract_gist_number($0, 2);

    push_gist_entry(gist_nr);
    next;
}


# skip these buggers:
/(\/|\.)cloud.github.com\//        {
    next;
}
/(\/|\.)gist.github.com\//        {
    # all suitable ones have been handled above...
    next;
}
/\/github.com\/gist\//        {
    next;
}
/\/github.com\/wiki\//        {
    next;
}
/\/github.com\/api\//        {
    next;
}
/\/github.com\/blog\//        {
    next;
}
/\/api.github.com\//        {
    next;
}
/\/raw.github.com\/wiki\//        {
    next;
}
/\/[^\/]+\.github.com\/blog\//        {
    next;
}
/[\/@]github.com\/[^\/]+\/blog\//        {
    next;
}
/[\/@]github.com\/[^\/]+\/blog\.git/        {
    next;
}


# https://raw.github.com/mlarocca/Dynamic-Charts/...
/\/raw.github.com\/[^\/]+\/[^\/]+/        {
    git_repo = extract_user_and_repo($0, 2);

    push_github_entry(git_repo);
    next;
}

# http://latentflip.github.com/d3/techmeetup
/\/[^\/]+\.github\.com\/[^\/]+/        {
    str = gensub(/^.*\/([^\/]+)\.github\.com\/([^\/]+)(\/.*)?$/, "\\1 \\2", "g", $0);

    split(str, a, " ");
    user = a[1];
    repo = clean_repo(a[2]);
    #printf("Selecting Github repo URI [%s/%s] for line '%s' '%s'\n", user, repo, $0, str);
    git_repo = user "/" repo;

    push_github_entry(git_repo);
    next;
}

# https://github.com/mlarocca/Dynamic-Charts/...
/\/github.com\/[^\/]+\/[^\/]+/        {
    git_repo = extract_user_and_repo($0, 2);

    push_github_entry(git_repo);
    next;
}

# git@github.com:mlarocca/Dynamic-Charts/...
/git@github\.com:[^\/]+\/[^\/]+/        {
    str = gensub(/^.*git@github\.com:/, "", 1, $0);
    git_repo = extract_user_and_repo(str, 1);

    push_github_entry(git_repo);
    next;
}



            {
    next;
}

END             {
    # nuke a few obvious entries:
    stmts["github-mbostock/d3"] = "";
    stmts["github-GerHobbelt/d3"] = "";
    stmts["github-zziuni/d3"] = "";
    stmts["github-johan/d3"] = "";
    stmts["github-latentflip/d3"] = "";

    max = asort(stmts);
    for (i = 1; i <= max; i++)
    {
        printf("%s\n", stmts[i]);
    }
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("\n");
    printf("echo \"</dl>\" >> examples_index.html\n");
    printf("echo \"</body></html>\" >> examples_index.html\n");
    printf("\n");
    printf("popd                                                                                                    2> /dev/null   > /dev/null\n");
    printf("\n");
    printf("\n");
    printf("#\n");
    printf("# The URLs below are included in this file to serve as 'memory',\n");
    printf("# i.e. to keep these around even when they are not (yet) listed\n");
    printf("# in the wiki documents which we scan for gists/github URIs.\n");
    printf("# This results in a rerun of the generate_git_fetch_script.sh\n");
    printf("# including all these repositories again, just like they were before.\n");
    printf("#\n");
    printf("# TL;DR: we don't loose any repo's we specified apart from the wiki itself.\n");
    printf("#\n");
    printf("#\n");
    printf("#\n");
    max = asort(comment_stmts);
    for (i = 1; i <= max; i++)
    {
        printf("# %s\n", comment_stmts[i]);
    }
}

