f=open("/usr/lib64/gnome-shell/libgnome-shell.so","rb")
s=f.read()
f.close()

# gesture
s=s.replace(b'GESTURE_FINGER_COUNT\x20=\x203',b'GESTURE_FINGER_COUNT\x20=\x204')

# overview startup animation
# s=s.replace(b'Main.panel.style\x20=\x20\'tr',b'callback();\x20return;\x20//')
s=s.replace(b'callback();\x20return;\x20//', b'Main.panel.style\x20=\x20\'tr')

f=open("libgnome-shell-replaced.so","wb")
f.write(s)
f.close()
