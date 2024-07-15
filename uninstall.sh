#!/bin/bash

kohaplugindir="$(grep -Po '(?<=<pluginsdir>).*?(?=</pluginsdir>)' $KOHA_CONF)"

echo "Removing $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport"
rm -r $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport
rm $kohaplugindir/Koha/Plugin/Fi/KohaSuomi/ExporterReport.pm

utilitydir="/home/koha/koha-suomi-utility"
perl $utilitydir/misc/manage_plugins.pl --remove Koha::Plugin::Fi::KohaSuomi::ExporterReport