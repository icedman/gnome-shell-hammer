# GDM Theme

The gdm login screen is, up until now still difficult to customize.
To theme it a little bit with custom background picture and some minimalist style touches run:

```sh
./extract.sh
./install.sh
```

Make sure to have your background / wallpaper saved at /usr/share/backgrounds/background.jpg

# Dash-to-Dock

If you use dash-to-dock use the version modified for gnome-40:

```sh
git clone https://github.com/ewlsh/dash-to-dock
git fetch --all
git checkout ewlsh/gnome-40
```

And uncomment this line in `extrach.sh`

```sh
cat dash.css >> ./theme/gnome-shell.css
```

Note: use this only if the offical dash-to-dock release is still messed up under gnome-40.

# gnome-40 three finger-swipe

WARNING: This has been reported to have issues with the latest gnome-shell. Use the extension version instead.

Three finger swipe to change workspace is a new addition in gnome-40. The switching animation is now smooth just like the way it is with macOS. However, many use four fingers to swipe between workspaces.

To switch back to four fingers simply run:

```sh
./compile.sh
```
Note: 
The threefingerwindowmove@do.sch.dev.gmail.com is pretty useful. Drag windows with three fingers.

# warning
These scripts are tested only under ArchLinux. Make sure you know how to switch to another tty and revert changes or reinstall gnome-shell in case something is messed up.


# extension
There is an extension version for the more prudent users. Just copy gnome-extension to:

```sh
~/.local/share/gnome-shell/extensions/gnome-shell-hammer@icedman.github.com
``` 

Enable. Logout.
