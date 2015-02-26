#
#   DIST.sh
#
#   David Janes
#   IOTDB
#   2015-02-10
#

PACKAGE=iotdb-smartthings
DIST_ROOT=/var/tmp/.dist.$$

if [ ! -d "$DIST_ROOT" ]
then
    mkdir "$DIST_ROOT"
fi

echo "=================="
echo "NPM Packge: $PACKAGE"
echo "=================="
(
    NPM_DST="$DIST_ROOT/$PACKAGE"
    echo "NPM_DST=$NPM_DST"

    if [ -d ${NPM_DST} ]
    then
        rm -rf "${NPM_DST}"
    fi
    mkdir "${NPM_DST}" || exit 1

    update-package --increment-version|| exit 1

    tar cf - \
        README.md \
        LICENSE.txt \
        package.json smartthings.js smartthingslib.js \
        |
    ( cd "${NPM_DST}" && tar xvf - )

    ## cp dist/*.* "${NPM_DST}" || exit 1

    cd "${NPM_DST}" || exit 1
    npm publish

    echo "end"
)
