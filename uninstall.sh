#!/bin/bash

kohaplugindir="$(grep -Po '(?<=<pluginsdir>).*?(?=</pluginsdir>)' $KOHA_CONF)"

rm -r $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport
rm $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport.pm
