#!/bin/sh

set +x

gst=/usr/share/gnome-shell/gnome-shell-theme.gresource
workdir=./

for r in `gresource list $gst`; do
	r=${r#\/org\/gnome\/shell/}
	if [ ! -d $workdir/${r%/*} ]; then
	  mkdir -p $workdir/${r%/*}
	fi
done

for r in `gresource list $gst`; do
        gresource extract $gst $r >$workdir/${r#\/org\/gnome\/shell/}
done

sh generate.xml.sh > ./theme/gnome-shell-theme.gresource.xml

sed '/custom/,$d' ./theme/gnome-shell.css > ./gnome-shell.css.orig

cp ./gnome-shell.css.orig ./theme/gnome-shell.css
cat custom.css >> ./theme/gnome-shell.css

# cp install.sh ./theme/
