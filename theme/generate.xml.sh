#!/bin.sh

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
echo "<gresources>"
echo "<gresource prefix=\"/org/gnome/shell/theme\">"

for file in theme/icons/scalable/actions/*.svg; do
    echo "<file>icons/scalable/actions/$(basename "$file")</file>"
done

for file in theme/icons/scalable/status/*.svg; do
    echo "<file>icons/scalable/status/$(basename "$file")</file>"
done

for file in theme/*.svg; do
    echo "<file>$(basename "$file")</file>"
done

for file in theme/*.css; do
    echo "<file>$(basename "$file")</file>"
done

echo "</gresource>"
echo "</gresources>"