# convert-to-webp.ps1
cd images
magick mogrify -format webp *.png
magick mogrify -format webp *.jpg
