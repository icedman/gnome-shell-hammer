f=open("/usr/lib64/gnome-shell/libgnome-shell.so","rb")
s=f.read()
f.close()
s=s.replace(b'GESTURE_FINGER_COUNT\x20=\x203',b'GESTURE_FINGER_COUNT\x20=\x204')
s=s.replace(b'RADIUS_PIXELS\x20=\x2030',b'RADIUS_PIXELS\x20=\x2010')

f=open("libgnome-shell-replaced.so","wb")
f.write(s)
f.close()
