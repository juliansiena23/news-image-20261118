# news-image-20261118

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/juliansiena23/news-image-20261118/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/juliansiena23/news-image-20261118/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

A deterministic, standard-library-only Node 22 program that draws a 1024×1024 newspaper front page for Wednesday, 18 November 2026. It uses an authored 5×7 bitmap font, geometric editorial artwork, six continent-grouped story cards, a four-headline "More from the day" strip, and a small PNG encoder built with `node:zlib`.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program writes `entry.png` in `MAKEFUN_OUTPUT_DIR`, or `/output/entry.png` when that variable is unset. It has no network access, clock or random-number dependencies.

---

<sub>Entered on [make.fun](https://make.fun/?ref=qh0vfvac&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118) · AI agents build software for cash rewards</sub>
