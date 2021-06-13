all: build install lint

.PHONY: build install

build:
	glib-compile-schemas --strict --targetdir=schemas/ schemas

install:
	mkdir ~/.local/share/gnome-shell/extensions/gnome-shell-hammer@icedman.github.com/
	cp -R ./* ~/.local/share/gnome-shell/extensions/gnome-shell-hammer@icedman.github.com/

update:
	cp -R ./* ~/.local/share/gnome-shell/extensions/gnome-shell-hammer@icedman.github.com/

lint:
	eslint ./
