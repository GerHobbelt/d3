#! /bin/bash

#
# http://bost.ocks.org/mike/join/
# http://bost.ocks.org/mike/d3/workshop/
# http://vimeo.com/29458354
# http://mbostock.github.com/d3/talk/20110921/#0
# http://bost.ocks.org/mike/uberdata/
# http://bost.ocks.org/mike/chart/
# http://bost.ocks.org/mike/path/
# https://github.com/mbostock/stack
#

pushd $(dirname $0)       2> /dev/null
#cd ..
#mkdir gists
#cd gists
mkdir \!descriptions

echo "<html><body>" > gists.html

echo "<h1>D3 example/test gists by others:</h1>" >> gists.html
echo "<dl>" >> gists.html

for f in \
                1005090 \
                1005873 \
                1009139 \
                1009308 \
                1014829 \
                1016220 \
                1016860 \
                1020902 \
                1021103 \
                1021841 \
                1021953 \
                1026649 \
                1036776 \
                1044242 \
                1046712 \
                1061834 \
                1062288 \
                1062383 \
                1062544 \
                1065859 \
                1065861 \
                1067616 \
                1067636 \
                1071269 \
                1071981 \
                1073373 \
                1074045 \
                1075123 \
                1076158 \
                1080941 \
                1083726 \
                1083732 \
                1086421 \
                1087001 \
                1090203 \
                1090691 \
                1093025 \
                1093130 \
                1095727 \
                1095795 \
                1096355 \
                1098617 \
                1100394 \
                1117287 \
                1123639 \
                1125339 \
                1125458 \
                1125997 \
                1129492 \
                1133472 \
                1134768 \
                1136236 \
                1137131 \
                1139473 \
                1148172 \
                1148365 \
                1153292 \
                1155488 \
                1157415 \
                1157787 \
                1159696 \
                1160929 \
                1163659 \
                1166403 \
                1169680 \
                1171371 \
                1175688 \
                1177827 \
                1177880 \
                1179647 \
                1182434 \
                1182485 \
                1184766 \
                1185705 \
                1187808 \
                1195063 \
                1197731 \
                1198017 \
                1199811 \
                1202253 \
                1212197 \
                1212215 \
                1214915 \
                1218859 \
                1219585 \
                1221654 \
                1221675 \
                1222777 \
                1224222 \
                1225313 \
                1226718 \
                1233904 \
                1243323 \
                1246403 \
                1249394 \
                1249681 \
                1249958 \
                1252867 \
                1256572 \
                1257485 \
                1262305 \
                1263239 \
                1266259 \
                1269004 \
                1271058 \
                1275654 \
                1275742 \
                1276463 \
                1277254 \
                1277968 \
                1283663 \
                1288493 \
                1291667 \
                1291672 \
                1303584 \
                1305111 \
                1305337 \
                1305347 \
                1306365 \
                1308257 \
                1308400 \
                1313857 \
                1314483 \
                1317455 \
                1320232 \
                1321837 \
                1322814 \
                1322907 \
                1322948 \
                1323729 \
                1323841 \
                1325574 \
                1326318 \
                1327441 \
                1337511 \
                1339996 \
                1341281 \
                1341679 \
                1343714 \
                1345853 \
                1346395 \
                1346410 \
                1351113 \
                1353700 \
                1357601 \
                1357620 \
                1363743 \
                1367999 \
                1368205 \
                1371412 \
                1373819 \
                1374397 \
                1377729 \
                1378144 \
                1379988 \
                1386444 \
                1389927 \
                1393200 \
                1399097 \
                1399117 \
                1399211 \
                1404346 \
                1405439 \
                1423627 \
                1439005 \
                1441881 \
                1457934 \
                1469438 \
                1473535 \
                1483226 \
                1484345 \
                1488375 \
                1488680 \
                1491435 \
                1502762 \
                1502887 \
                1503463 \
                1505811 \
                1508606 \
                1509502 \
                1516547 \
                1535916 \
                1536332 \
                1552725 \
                1624660 \
                1629464 \
                1629644 \
                1642874 \
                1642989 \
                1643051 \
                1653763 \
                1667367 \
                1691430 \
                1706523 \
                1706849 \
                1846692 \
                1869677 \
                1871853 \
                1893974 \
                1920939 \
                1933560 \
                1935509 \
                1962173 \
                1963983 \
                2005817 \
                2011590 \
                2086461 \
                2164562 \
                2165875 \
                2206590 \
                2209220 \
                2280295 \
                2287399 \
                2289263 \
                2294676 \
                2295155 \
                2295263 \
                2322933 \
                2368837 \
                2759731 \
                2846454 \
                2883411 \
                2920551 \
                2966094 \
                300494 \
                3019563 \
                3048166 \
                3048450 \
                3173233 \
                3287802 \
                3290263 \
                3310323 \
                3391642 \
                3543186 \
                3605124 \
                3630001 \
                3689677 \
                3711245 \
                3711652 \
                3732612 \
                3750941 \
                3808218 \
                3828981 \
                3883195 \
                3883245 \
                3884914 \
                3884955 \
                3885211 \
                3885304 \
                3885705 \
                3886208 \
                3886394 \
                3887051 \
                3887118 \
                3887193 \
                3887235 \
                3888852 \
                3894205 \
                3918369 \
                3921009 \
                3943967 \
                4047002 \
                4053096 \
                4054247 \
                4055908 \
                4060366 \
                4060606 \
                4060954 \
                4061502 \
                4061961 \
                4062006 \
                4062045 \
                4062085 \
                4063269 \
                4063318 \
                4063423 \
                4063530 \
                4063550 \
                4063570 \
                4063582 \
                4091835 \
                4092944 \
                4149176 \
                4168921 \
                4175202 \
                4236639 \
                4241134 \
                4246925 \
                4248145 \
                4339162 \
                4340039 \
                4342190 \
                4370043 \
                4481531 \
                4526201 \
                4548858 \
                458648 \
                4589092 \
                4626240 \
                4710330 \
                4955504 \
                5001347 \
                583229 \
                583734 \
                584742 \
                597287 \
                597292 \
                600164 \
                603062 \
                603148 \
                609059 \
                625531 \
                625657 \
                645734 \
                645758 \
                647888 \
                660054 \
                665906 \
                667245 \
                672899 \
                675512 \
                705856 \
                710387 \
                843177 \
                844752 \
                846688 \
                846704 \
                846710 \
                847677 \
                849853 \
                870118 \
                881980 \
                882152 \
                899649 \
                899670 \
                899711 \
                900050 \
                906688 \
                910126 \
                929623 \
                938288 \
                939927 \
                940838 \
                950642 \
                972398 \
                993912 \
                999346 \
		; do
	if ! test -d gist-$f ; then
		git clone git://gist.github.com/$f.git gist-$f
	fi
	pushd .
	cd gist-$f
	git pull --all
	popd
	echo "<dt>$f (View: <a href='http://bl.ocks.org/$f'>bl.ocks.org</a> / <a href='./gist-$f/'>local</a>)</dt>" >> gists.html
	if ! test -f \!descriptions/$f.txt ; then
		curl -o \!descriptions/$f.txt https://api.github.com/gists/$f 
	fi
	echo "<dd>" >> gists.html
	grep '"description"' \!descriptions/$f.txt >> gists.html
	echo "</dd>" >> gists.html
done

echo "</dl>" >> gists.html
echo "<h1>My own gists:</h1>" >> gists.html

#
# and clone/pull our own D3 related gists as well:
#
echo "<dl>" >> gists.html
for f in \
                1547192 \
                1800198 \
                1867866 \
                1883717 \
                1887532 \
                1965462 \
                2037124 \
                2286893 \
                2366983 \
                2504633 \
                2505393 \
                2511921 \
                2512177 \
                2514183 \
                2522156 \
                2597692 \
                2599189 \
                2623079 \
                2653660 \
                2724230 \
                2724323 \
                2727824 \
                2997144 \
                3070621 \
                3070659 \
                3071239 \
                3104394 \
                3116650 \
                3116713 \
                3116836 \
                3116844 \
                3117757 \
                3118901 \
                3125020 \
                3125434 \
                3125600 \
                3138656 \
                3154300 \
                3154741 \
                3173233 \
                3175935 \
                3190391 \
                3192376 \
                3203343 \
                3331545 \
                3331937 \
                3349192 \
                3480186 \
                3605035 \
                3605069 \
                3605124 \
                3616279 \
                3637711 \
                3669333 \
                3669455 \
                3670903 \
                3671490 \
                3671592 \
                3683278 \
                3683489 \
                3695277 \
                3732612 \
                3732893 \
                3772069 \
                3697451 \
                3732612 \
                3696645 \
                3695277 \
                3683489 \
                3671592 \
                3671490 \
                3670903 \
                3669455 \
                3637711 \
                3616279 \
                3480186 \
                3331937 \
                3331545 \
                3203343 \
                3192376 \
                3190391 \
                3175935 \
                3173233 \
                3154741 \
                3154300 \
                5194757 \
                d4c39a7c29c600b7e964 \
		; do
	if ! test -d gist-$f-mine ; then
		git clone git@gist.github.com:$f.git gist-$f-mine
	fi
	pushd .
	cd gist-$f-mine
	git pull --all
	git push --all
	popd
	echo "<dt>$f (View: <a href='http://bl.ocks.org/$f'>bl.ocks.org</a> / <a href='./gist-$f/'>local</a></dt>" >> gists.html
	if ! test -f \!descriptions/$f.txt ; then
		curl -o \!descriptions/$f.txt https://api.github.com/gists/$f 
	fi
	echo "<dd>" >> gists.html
	grep '"description"' \!descriptions/$f.txt >> gists.html
	echo "</dd>" >> gists.html
done
echo "</dl>" >> gists.html

popd

