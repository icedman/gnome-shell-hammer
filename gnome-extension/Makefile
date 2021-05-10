all: build install lint

.PHONY: build install

build:
	glib-compile-schemas --strict --targetdir=schemas/ schemas

install:
	cp -R ./* ~/.local/share/gnome-shell/extensions/gnome-shell-hammer@icedman.github.com/

lint:
	eslint ./
