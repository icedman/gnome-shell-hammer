#!/bin/sh

set +x

cd theme
glib-compile-resources gnome-shell-theme.gresource.xml
sudo cp ./gnome-shell-theme.gresource /usr/share/themes/Yaru/gnome-shell/
cd ..