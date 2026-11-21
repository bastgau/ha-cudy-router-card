# Cudy Router Card

Lovelace card for the `cudy_router` integration: live bandwidth, bandwidth history, router status, Wi-Fi (2.4 / 5 GHz), connected devices, VPN and WISP, with controls (switches, selects, reboot) protected by a confirmation dialog.

Derived from [Freebox Card](https://github.com/KroFR/freebox-ha-card) by KroFR (MIT).

## How entities are found

Everything is read from `hass.entities` and `hass.devices`, so the card works for **every user**, not only administrators. You pick the router **device** (`device_id`; without it, the first Cudy router found is used). In that device, for each role the card tries, in order:

1. the `translation_key` of the entity (if the integration sets one);
2. the `entity_id` built from the device prefix and the role (`button.<prefix>reboot` gives the prefix);
3. the shortest `entity_id` ending with the role name.

Renaming an entity's *display name* changes nothing. If an `entity_id` is renamed, force the role with `entities:`.

## Installation

HACS → Custom repositories → `https://github.com/bastgau/ha-cudy-router-card` (type *Dashboard*), then add the resource `/hacsfiles/ha-cudy-router-card/cudy-card.js`.

## Configuration

```yaml
type: custom:cudy-router-card
device_id: 233737be76ee725f69d9ec7cec80f9ae   # optional, auto-detected
name: Cudy
download_bandwidth: 300      # Mbit/s, scale of the gauges
upload_bandwidth: 100
history_hours: 24
section_order: [internet, system, wifi, devices, vpn, wisp]
show_wisp: false
show_controls: true          # false = read-only
entities:                    # optional override per role
  publicIp: sensor.public_ip
```

| Option | Default | Description |
|---|---|---|
| `device_id` | auto | Cudy router device |
| `name` | `Cudy` | Card title |
| `language` | `auto` | `auto`, `en`, `fr` |
| `download_bandwidth`, `upload_bandwidth` | – | Maximum in Mbit/s (gauge colors) |
| `history_hours` | `24` | 1 – 168 |
| `section_order` | see above | Order of sections |
| `show_internet`, `show_system`, `show_wifi`, `show_devices`, `show_vpn` | `true` | Sections |
| `show_wisp` | `false` | WISP section |
| `show_header`, `show_card_background`, `show_live_metrics`, `show_bandwidth_history`, `show_reboot_button` | `true` | Display |
| `show_controls` | `true` | Allow switches, selects and buttons |
| `entities` | – | Role → entity id override |

Roles: see `ROLES` in `dist/cudy-card.js`.
