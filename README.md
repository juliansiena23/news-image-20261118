# World Dispatch: 18 November 2026

A deterministic, standard-library-only Node 22 program that draws a 1024×1024 newspaper front page for Wednesday, 18 November 2026. It uses an authored 5×7 bitmap font, geometric editorial artwork, six continent-grouped story cards, a four-headline “More from the day” strip, and a small PNG encoder built with `node:zlib`.

Run it from this directory with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program writes `entry.png` in `MAKEFUN_OUTPUT_DIR`, or `/output/entry.png` when that variable is unset. It has no network access, clock or random-number dependencies.
