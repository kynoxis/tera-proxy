---
permalink: /mods
title: Mods Directory
classes: page--mods

categories:
- header: Notable Mods
  description: "The big guns. These mods are more than simple scripts."
  modules:
  - repo: pinkipi/skill-prediction
    desc: Simulates skills client-side, eliminating ping-based delays and animation lock.
  - repo: SaltyMonkey/skill-prediction
    desc: Separately-maintained fork of original skill-prediction. May work better for certain classes.
  - repo: codeagon/fps-utils
    desc: Lets you hide players, effects, etc. in order to improve FPS.
  - repo: hackerman-caali/battle-notify
    desc: Shows text notifications on configurable in-game events.
- header: Quality of Life
  description: "These mods are relatively benign, and there's likely little risk to using these. But they *will* make your life better, probably."
  modules:
  - repo: TeraProxy/AFKer
    desc: Prevents the client from going back to character selection.
  - repo: pinkipi/autovanguard
    desc: Automatically turns in Vanguard quests upon completion.
  - repo: teralove/camera-distance
    desc: Removes limit on the camera's max range.
  - repo: teralove/channel-command
    desc: Switch channels via chat command.
  - repo: TeraProxy/EnrageNotifier
    desc: Shows private party notices for enrage and next enrage percentage.
  - repo: teralove/exit-command
    desc: Exit the game via chat command.
  - repo: teralove/exit-instantly
    desc: Exit the game without having to wait 10 seconds. (Basically clicking the X button.)
  - repo: teralove/lobby-command
    desc: Return to lobby (character select) via chat command.
  - repo: hackerman-caali/no-custom-loadingscreens
    desc: Disables custom loading screens supplied by the publishers.
  - repo: teralove/no-directional-skills
    desc: Removes directional input on some skills.
  - repo: Mister-Kay/no-more-crazy-capes
    desc: Removes exploding physics glitch from some back items.
  - repo: Mister-Kay/no-more-noctenium-lag
    desc: Removes client-side lag from specific packets while noctenium consumable is active. *Does not prevent network lag.*
  - repo: teralove/parcel-helper
    desc: Instantly accept all parcels and delete all read messages.
  - repo: teralove/party-death-markers
    desc: Shows rare item beacon on party member corpses.
  - repo: wuaw/relog
    desc: Switch character via chat command.
  - repo: teralove/remove-idles
    desc: Disable idle animations.
  - repo: SaltyMonkey/Salt-remover
    desc: Removes some annoying game messages.
  - repo: pinkipi/skill-resets
    desc: Pops up a message whenever a skill resets.
  - repo: pinkipi/skip-cutscenes
    desc: No more mashing Esc after killing a boss. Pretend cutscenes don't even exist.
  - repo: wuaw/timestamps
    desc: Shows timestamps in chat.
- header: Grey Area
  description: "The ones you want to avoid mentioning in public. These give additional QoL advantages which aren't obtainable with simple macros or low ping."
  modules:
  - repo: soler91/AfkRewards
    desc: Accepts Allegiance event rewards automatically.
  - repo: pinkipi/auto-negotiate
    desc: Automatically accepts or declines broker negotiations. Configurable.
  - repo: Xtortion/Autostance
    desc: Automatically uses stance skills if they aren't activated.
  - repo: wuaw/broker-anywhere
    desc: Open the broker. Anywhere.
  - repo: soler91/CustomMounts
    desc: Use any mount (Clientside).
  - repo: Saegusae/fly-more
    desc: Ignores flying mount stamina for infinite flying. *Semi-patched and may cause mid-air dismounts.*
  - repo: Saegusae/loot
    desc: Automatically loots items around you at superhuman speed. Goodbye, loot pets.
  - repo: pinkipi/loot
    desc: Fork of the original loot mod. Includes throttling to prevent disconnects.
  - repo: TeraProxy/ManaPotter
    desc: Automatically uses a Prime Replenishment Potable when under 50% MP.
  - repo: pinkipi/true-everful-nostrum
    desc: Automatically uses Everful Nostrum (Elite/TERA Club/Premium/etc.) so that it never expires.
- header: Fun Mods
  description: "These do silly things that aren't really important."
  modules:
  - repo: TeraProxy/Teabagger
    desc: but rly tho?
  - repo: godartm/Tera-AOT
    desc: Makes everyone wear the Attack on Titan costume.
---

Here is a directory with links to a number of GitHub projects and developers who work with tera-proxy or other TERA modding programs. That means **all projects directly linked here are free and open source**.

If you want to be added to this list, or you think a module has been miscategorized, [submit a PR](https://github.com/pinkipi/tera-proxy/edit/gh-pages/_pages/modules.md).

{% for category in page.categories %}

## {{ category.header }}

{{ category.description }}

| Module | Description |
| --- | --- |{% for module in category.modules %}{% assign repo = module.repo | split: "/" %}{% assign user = module.author %}{% unless user %}{% assign user = repo[0] %}{% endunless %}
| [{% avatar user=user %}][@{{ user }}] [{{ repo[1] }}](https://github.com/{{ module.repo }}) | {{ module.desc }} |{% endfor %}

{% endfor %}

## Module Developers

For any other kind of module, you may want to take a look at public repositories or websites. Below is a list of module developers on GitHub, along with links to other sources where you may find more information or modules not publicly posted.

* [{% avatar pinkipi %} pinkipi][@pinkipi] &ndash; [Discord](https://discord.gg/RR9zf85)
* [{% avatar hackerman-caali %} hackerman-caali][@hackerman-caali] &ndash; [Discord](https://discord.gg/maqBmJV)
* [{% avatar Bernkastel-0 %} Bernkastel-0][@Bernkastel-0] &ndash; [tumblr](http://teraproxy.tumblr.com/)
* [{% avatar codeagon %} codeagon][@codeagon]
* [{% avatar Saegusae %} Saegusae][@Saegusae]
* [{% avatar soler91 %} soler91][@soler91]
* [{% avatar teralove %} teralove][@teralove]
* [{% avatar TeraProxy %} TeraProxy][@TeraProxy]
* [{% avatar wuaw %} wuaw][@wuaw]

## Related Projects

tera-proxy is just one of many projects aimed at modding and extending TERA functionality. These related projects are not modules; they are standalone programs that do their own thing with or without tera-proxy.

* [Alkahest](https://github.com/alexrp/alkahest) ([@alexrp]): An extensible .NET proxy server with additional tools for accessing game client data.
* [ShinraMeter](https://github.com/neowutran/ShinraMeter) ([@neowutran], [@Gl0]): A TERA DPS meter.
* [Tera Custom Cooldowns](https://github.com/Foglio1024/Tera-custom-cooldowns) ([@Foglio1024]): Replaces some TERA UI elements with sleek and responsive designs.



[//]: # (GitHub @mention link references go below.)

[@alexrp]: <https://github.com/alexrp> "Alex Rønne Petersen"
[@baldera-mods]: <https://github.com/baldera-mods> "Meishu's Baldera Mods"
[@Bernkastel-0]: <https://github.com/Bernkastel-0> "Bernkastel"
[@codeagon]: <https://github.com/codeagon> "Huge Dong 69"
[@Foglio1024]: <https://github.com/Foglio1024> "Foglio"
[@Gl0]: <https://github.com/Gl0> "Gl0"
[@hackerman-caali]: <https://github.com/hackerman-caali> "Caali"
[@lunyx]: <https://github.com/lunyx> "Daniel"
[@meishuu]: <https://github.com/meishuu> "Meishu"
[@Mister-Kay]: <https://github.com/mister-kay>
[@neowutran]: <https://github.com/neowutran> "Yukikoo"
[@pinkipi]: <https://github.com/pinkipi> "Pinkie Pie"
[@Saegusae]: <http://github.com/saegusae> "Seagoose"
[@SaltyMonkey]: <http://github.com/SaltyMonkey> "Monkey"
[@soler91]: <http://github.com/soler91> "Fruit"
[@teralove]: <https://github.com/teralove>
[@TeraProxy]: <https://github.com/TeraProxy>
[@wuaw]: <https://github.com/wuaw>
[@Xtortion]: <https://github.com/Xtortion>
