#
# GAWK script to extract repository description for github / gists repositories.
#


function extract_value(line,     str) {
    # because MSys gawk doesn't support match() with 3 arguments :-((
    str = gensub(/^[^:]+:/, "", 1, line);
    #printf("extract_value [%s] for input [%s]\n", str, line);
    str = gensub(/^ *\"/, "", 1, str);
    #printf("extract_value [%s]\n", str);
    str = gensub(/,$/, "", 1, str);
    #printf("extract_value [%s]\n", str);
    str = gensub(/\"$/, "", 1, str);
    #printf("extract_value [%s]\n", str);
    return str;
}

function html_encode(str) {
    str = gensub(/&/, "&amp;", "g", str);
    str = gensub(/</, "&lt;", "g", str);
    str = gensub(/>/, "&gt;", "g", str);
    return str;
}

function mk_path(str) {
    str = gensub(/[^a-zA-Z0-9_.-]+/, ".", "g", str);
    str = gensub(/\.+/, ".", "g", str);
    return str;
}

function trim(v) {
    ## Remove leading and trailing spaces (add tabs if you like)
    sub(/^ */, "", v);
    sub(/ *$/, "", v);
    return v;
} 

BEGIN {
    state = 0;
    idx = 0;
    if (length(gist) > 0) {
        is_gist = 1;
        repo_id = gist;
        repo_type = "gist";
    } else if (length(github) > 0) {
        is_github = 1;
        repo_id = github;
        repo_type = "github";
    }

    gist_nr = "";
    create_date = "";
    update_date = "";
    description = "";
    owner = "";
}


/"id":/         {
    if (state >= 1) {
        next;
    }
    gist_nr = extract_value($0);
    #printf("Selecting Gist URI [%s] for line '%s'\n", gist_nr, $0);
    state = 1;
}

/"created_at":/         {
    if (state >= 2) {
        next;
    }
    create_date = extract_value($0);
    create_date = trim(gensub(/[TZ]/, " ", "g", create_date));
    #printf("Selecting Gist create_date [%s] for line '%s'\n", create_date, $0);
    state = 2;
}

/"updated_at":/         {
    if (state >= 3) {
        next;
    }
    # because MSys gawk doesn't support match() with 3 arguments :-((
    update_date = extract_value($0);
    update_date = trim(gensub(/[TZ]/, " ", "g", update_date));
    #printf("Selecting Gist update_date [%s] for line '%s'\n", update_date, $0);
    state = 3;
}

# this one is optional!!

/"description":/         {
    if (state >= 4) {
        next;
    }
    # because MSys gawk doesn't support match() with 3 arguments :-((
    description = trim(extract_value($0));
    #printf("Selecting Gist description [%s] for line '%s'\n", description, $0);
    state = 4;
}

/"user":/               {
    if (state >= 5) {
        next;
    }
    # because MSys gawk doesn't support match() with 3 arguments :-((
    state = 5;
}

/"login":/         {
    if (state >= 5) {
        next;
    }
    # because MSys gawk doesn't support match() with 3 arguments :-((
    owner = extract_value($0);
    #printf("Selecting Gist owner [%s] for line '%s'\n", owner, $0);
    state = 5;
}



            {
    next;
}

END             {
    if (is_gist) {
        printf("<dt>\n%s: %s\n</dt>\n<dd>\n<p class='xrefs'>View: <a href='http://bl.ocks.org/%s'>bl.ocks.org</a> / <a href='https://gist.github.com/%s'>gist</a> / <a href='gist-%s/'>local</a></p>\n", repo_type, repo_id, repo_id, repo_id, repo_id);
    } else if (is_github) {
        printf("<dt>\n%s: %s\n</dt>\n<dd>\n<p class='xrefs'>View: <a href='https://github.com/%s'>github</a> / <a href='github.%s/'>local</a></p>\n", repo_type, repo_id, repo_id, mk_path(repo_id));
    } else {
        printf("<dt>\n%s: %s\n</dt>\n<dd>\n<p class='xrefs'>View: ???</p>\n", repo_type, repo_id);
    }
    printf("<p class='owner'>Owner: %s</p>\n", owner);
    printf("<p class='dates'>Created: %s, Last Updated: %s</p>\n", create_date, update_date);
    printf("<h3>Description</h3>\n");
    printf("<p class='description'>%s</p>\n", html_encode(description));
    printf("</dd>\n");
}

