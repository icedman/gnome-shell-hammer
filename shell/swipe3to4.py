f=open("/usr/lib64/gnome-shell/libgnome-shell.so","rb")
s=f.read()
f.close()
s=s.replace(b'GESTURE_FINGER_COUNT\x20=\x203',b'GESTURE_FINGER_COUNT\x20=\x204')
s=s.replace(b'RADIUS_PIXELS\x20=\x2030',b'RADIUS_PIXELS\x20=\x2010')

# s=s.replace(b'Main.panel.style\x20=\x20\'tr',b'callback();\x20return;\x20//')
# s=s.replace(b'/*\x20exported ControlsManager\x20*/',b'MUIG=imports.ui.main.uiGroup/')
# s=s.replace(b'MUIG.add_child(this.dash);',b'this.add_child(this.dash);')

f=open("libgnome-shell-replaced.so","wb")
f.write(s)
f.close()
