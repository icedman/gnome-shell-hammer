# GDM Theme

The gdm login screen is, up until now still difficult to customize.
To theme it a little bit with custom background picture and some minimalist style touches run:

```sh
./extract.sh
./install.sh
```

Make sure to have your background / wallpaper saved at /usr/share/backgrounds/background.jpg

# gnome-40 three finger-swipe

Three finger swipe to change workspace is a new addition in gnome-40. The switching animation is now smooth just like the way it is with macOS. However, many use four fingers to swipe between workspaces.

Simply run:

```sh
./compile.sh
```

# warning
These scripts are tested only under ArchLinux. Make sure you know how to switch to another tty and revert changes or reinstall gnome-shell in case something is messed up.