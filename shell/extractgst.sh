#!/bin/sh

set +x

gst=/usr/lib64/gnome-shell/libgnome-shell.so
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
