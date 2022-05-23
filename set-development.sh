#!/bin/bash

kohaplugindir="$(grep -Po '(?<=<pluginsdir>).*?(?=</pluginsdir>)' $KOHA_CONF)"
kohadir="$(grep -Po '(?<=<intranetdir>).*?(?=</intranetdir>)' $KOHA_CONF)"

rm -r $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport
rm $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport.pm

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

ln -s "$SCRIPT_DIR/Koha/Plugin/Fi/KohaSuomi/ExporterReport" $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport
ln -s "$SCRIPT_DIR/Koha/Plugin/Fi/KohaSuomi/ExporterReport.pm" $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport.pm

perl $kohadir/misc/devel/install_plugins.pl

