#
# GAWK script to extract repository description for github / gists repositories.
#


BEGIN {
    state = 0;
    idx = 0;
    stmts[0] = "";
}




            {
    next;
}

END             {
    for (i = 1; i <= max; i++)
    {
        printf("%s\n", stmts[i]);
    }
}

