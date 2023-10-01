#!/bin/sh

mkdir -p ~/.config/gtk-3.0
mkdir -p ~/.config/gtk-4.0
cp ./gtk-4.0/gtk.css ~/.config/gtk-4.0/gtk.css
cp ./gtk-3.0/gtk.css ~/.config/gtk-3.0/gtk.css
cp ./*.svg ~/.config/gtk-4.0/
cp ./*.svg ~/.config/gtk-3.0/