# GDM Theme

The gdm login screen is, up until now still difficult to customize.
To theme it a little bit with custom background picture and some minimalist style touches run:

```sh
./extract.sh
./install.sh
```

Make sure to have your background / wallpaper saved at /usr/share/backgrounds/background.jpg

# Dash2Dock-Lite

My own dash-to-dock implementation. Less features that Dash-To-Dock - and so less likely to break at gnome updates. I also has an animation feature like the macOS dock.

https://github.com/icedman/dash2dock-lite

# Dash Animator

My other extension which adds animation to Dash-to-Dock.

https://github.com/icedman/dash-animator

# gnome-40 three finger-swipe

Three finger swipe to change workspace is a new addition in gnome-40. The switching animation is now smooth just like the way it is with macOS. However, I want to use four fingers to swipe between workspaces, not three. And as of gnome-42, there is no way to reconfigure the shell.

To switch back to four fingers simply run:

```sh
./compile.sh
```
Note: 
The threefingerwindowmove@do.sch.dev.gmail.com is pretty useful. Drag windows with three fingers.

# warning

These scripts modify the gnome-shell libraries. These are also tested only under ArchLinux. Make sure you know how to switch to another tty and revert changes or reinstall gnome-shell in case something is messed up.

# extension

gnome-shell-hammer non-intrusive or extension version is broken as of gnome-42
