# Changes

## 2026-11-13 (owner request)
- Daily uploads cut to 3 (Malaysia time: 5:45pm, 8:45pm, 12:45am). A 'gate' job skips runs outside these slots, so cron-job.org needs no change. Manual run outside slots: tick 'force'.
- Reason: many uploads a day were splitting views; fewer videos should each get a bigger push.

## 2026-11-14
- Titles back to the POV form ('POV: <Jagah> Ki Raat Ke N Rules. ... Kabhi Mat ...'). The 'Night Shift: <Job> | N Rules To Survive' titles got 0-3 views in 10-17 h, while POV titles got 6-391.
- Night-shift settings now picked 35% of the time (was 75%), so more open places like petrol pump / cricket ground.
- Hook, place-repeat block and 3 videos/day stay.

## 2026-11-14 (23:00 MY) - trend research
- New 'creatures' list (12 desi folklore encounters: lantern-wali chudail on the bike, backward-feet woman, naag with human eyes...). Picked 40% of the time; night-shift places 20%, other places 40%.
- Creature titles: '😱 <one shocking line>! 😨 | Horror Story'. Other titles stay POV.
- Why: the top Hindi/Urdu horror Shorts from 4-14 Nov were folklore creature 'True Horror Story' videos with 0.9M-4.5M views each.
- Folk creatures allowed; still no jinn, prayers or holy places.

## 2026-11-14 (23:55 MY)
- SHORT_SCENES 10 -> 7 (about 30s, 3 rules). Analytics for 1-11 Nov: viewers leave after 13-25s on 45-77s videos (18-42% viewed); the 41s video kept 42%. A shorter video gets a higher % viewed, which YouTube uses to decide on more reach.

## 2026-11-15 (11:00 MY) - cartoon test
- Pictures switched from dark 3D renders to a 2D 'bhoot wala cartoon' style (flat colours, black outlines, spooky night colours); YOU is now the same cartoon young man in a white kurta in every picture; beings are cartoon ghosts with glowing eyes. Why: that style gets 1-4M views on Hindi/Urdu horror Shorts, while the realistic look got 0-60 views lately.
- Every run saves its newest video to the 'qa' branch so it can be checked.
- Repeat block: the wedding theme now also matches Urdu words (shadi, baraat, dulhan, mehndi). The 15 Nov cartoon test repeated 'Shadi Hall' from 14 Nov because Urdu titles did not match 'wedding'.

## 2026-11-15 (21:00 MY)
- Owner request: same times as Empire Maps. 3 videos a day at 2:50am, 12:50pm, 10:50pm Malaysia time (gate hours 02 12 22, only cron calls at :50). Needs one cron-job.org job: 50 02,12,22 * * * (Asia/Kuala_Lumpur); the old :45 jobs are ignored.
- 23:25 MY: the 22:50 AI Wala slot was missed because cron-job.org still called at :45 (the gate only took :50). The gate now takes any call in the slot hour and skips if history.json was updated in the last hour, so :45 + :50 calls can never make two videos.

## 16 Nov 2026 (00:05 MY)
- AI Wala is now a map channel: "how countries got their borders", Urdu voice + Roman Urdu captions (brand NAQSHA WALA). Uses the Empire Maps engine pinned at 2b676f2 + maps/topics.json + maps/script.js. Old horror code is kept but not used. Same slots (2:50am, 12:50pm, 10:50pm MY). Horror videos stopped (0-5 views each). Videos already on the channel are not touched.
- 00:50 MY: own colours for this channel (maps/theme.py, theme 'naqsha') so it does not look like Empire Maps.
- 16 Nov 11:30 MY: Naqsha Wala slots changed on owner request: calls at 22:50, 00:50, 02:50 MY so videos are live about 11pm, 1am, 3am. cron-job.org: 50 22,0,2 * * *
- 17 Nov 18:30 MY: for more views: hook in the first 2 seconds, Shorts now 30-38 s (max 5 map years, 7-13 words per line), last line loops back into the first line.
