#!/bin/sh

set +x

python swipe3to4.py
sudo chmod a+x libgnome-shell-replaced.so
sudo chown root:root libgnome-shell-replaced.so
sudo cp libgnome-shell-replaced.so /usr/lib64/gnome-shell/libgnome-shell.so