#!/bin/sh

set +x

gst=/usr/share/themes/Yaru/gnome-shell/gnome-shell-theme.gresource
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

sed '/custom/,$d' ./theme/gdm.css > ./gdm.css.orig

cp ./gdm.css.orig ./theme/gdm.css
cat custom.css >> ./theme/gdm.css
# cat dash.css >> ./theme/gdm.css

# cp install.sh ./theme/
