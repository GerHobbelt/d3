#
# GAWK script to extract repository description for github / gists repositories.
#


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
    # because MSys gawk doesn't support match() with 3 arguments :-((
    str = gensub(/^.*:/, "", 1, $0);
    split(str, a, "\"");
    gist_nr = a[2];
    printf("Selecting Gist URI [%s] for line '%s' '%s'\n", gist_nr, $0, str);
    state = 1;
}

/"created_at":/         {
    if (state >= 2) {
        next;
    }
    # because MSys gawk doesn't support match() with 3 arguments :-((
    str = gensub(/^.*:/, "", 1, $0);
    split(str, a, "\"");
    create_date = a[2];
    create_date = gensub(/[TZ]/, " ", "g", create_date);
    printf("Selecting Gist create_date [%s] for line '%s' '%s'\n", create_date, $0, str);
    state = 2;
}

/"updated_at":/         {
    if (state >= 3) {
        next;
    }
    # because MSys gawk doesn't support match() with 3 arguments :-((
    str = gensub(/^.*:/, "", 1, $0);
    split(str, a, "\"");
    update_date = a[2];
    update_date = gensub(/[TZ]/, " ", "g", update_date);
    printf("Selecting Gist update_date [%s] for line '%s' '%s'\n", update_date, $0, str);
    state = 3;
}

# this one is optional!!

/"description":/         {
    if (state >= 4) {
        next;
    }
    # because MSys gawk doesn't support match() with 3 arguments :-((
    str = gensub(/^.*: *\"/, "", 1, $0);
    str = gensub(/\"$/, "", 1, str);
    description = str;
    printf("Selecting Gist description [%s] for line '%s' '%s'\n", description, $0, str);
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
    str = gensub(/^.*:/, "", 1, $0);
    split(str, a, "\"");
    owner = a[2];
    printf("Selecting Gist owner [%s] for line '%s' '%s'\n", owner, $0, str);
    state = 5;
}



            {
    next;
}

END             {
    printf("<h2>%s: %s</h2>\n", repo_type, repo_id);
    printf("<p class='owner'>Owner: %s</p>\n", owner);
    printf("<p class='dates'>Created: %s, Last Updated: %s</p>\n", create_date, update_date);
    printf("<h3>Description</h3>\n");
    printf("<p class='description'>%s</p>\n", description);
}

