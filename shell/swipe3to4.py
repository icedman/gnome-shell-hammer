f=open("/usr/lib64/gnome-shell/libgnome-shell.so","rb")
s=f.read()
f.close()
s=s.replace(b'GESTURE_FINGER_COUNT\x20=\x203',b'GESTURE_FINGER_COUNT\x20=\x204')

f=open("libgnome-shell-replaced.so","wb")
f.write(s)
f.close()