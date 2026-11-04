#!/bin/sh
# Rebuilds the self-hosted fonts in public/fonts, limited to the axes, weights
# and characters the film uses. Requires fonttools (pip install fonttools brotli).
set -e
cd "$(dirname "$0")/.."
OUT=public/fonts
TMP=$(mktemp -d)
UNI="U+0020-007E,U+00A0-00FF,U+2010-2015,U+2018-201E,U+2022,U+2026,U+2032-2033,U+2190-2193,U+2212,U+00D7,U+2248,U+2264-2265,U+2713,U+27E8-27E9"
subset() { pyftsubset "$1" --unicodes="$UNI" --layout-features='kern,liga,tnum,lnum,case' --flavor=woff2 --output-file="$2"; }

fonttools varLib.instancer node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2 wdth=100:125 wght=300:600 -q -o "$TMP/a.woff2"
fonttools varLib.instancer node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2 wght=400:400 -q -o "$TMP/ni.woff2"
rm -f "$OUT"/*.woff2
subset "$TMP/a.woff2" "$OUT/archivo.woff2"
subset "$TMP/ni.woff2" "$OUT/newsreader-italic.woff2"
subset node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2 "$OUT/plex-mono.woff2"
rm -rf "$TMP"
ls -la "$OUT"
