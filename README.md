# Cudy Router Card

Lovelace card for the `cudy_router` integration: live bandwidth, bandwidth history, router status, Wi-Fi (2.4 / 5 GHz), connected devices, VPN and WISP, with controls (switches, selects, reboot) protected by a confirmation dialog.

Derived from [Freebox Card](https://github.com/KroFR/freebox-ha-card) by KroFR (MIT).

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
| `entities` | – | Role → entity id override (see [Roles](#roles-and-entity-ids)) |

## How entities are found

Everything is read from `hass.entities` and `hass.devices`, so the card works for **every user**, not only administrators.

1. The router is the `device_id` you pick. Without it, the first device exposing a `cudy_router` `button.<prefix>reboot` is used.
2. The **prefix** is the part of that reboot button's entity id before `reboot`. For `button.network_cudy_router_reboot` the prefix is `network_cudy_router_`.
3. For each role, the card looks, among the `cudy_router` entities of the router device, for `<domain>.<prefix><slug>` (exact match). If it does not exist, it takes the **shortest** entity id of that domain that ends with `_<slug>` (so `protocol` is never confused with `vpn_protocol`, nor `dns` with `preferred_dns`).
4. The `entities:` option always wins over steps 2 and 3.
5. Connected devices are the `device_tracker` entities of the `cudy_router` platform whose device belongs to the same config entry as the router.

The integration does not set a `translation_key` on its entities, so matching relies on entity ids: renaming an entity's *display name* changes nothing, but if you rename an *entity id*, force the role with `entities:`.

## Roles and entity ids

59 roles, with the entity id the card expects (`<prefix>` = see above, `network_cudy_router_` on the author's setup). Wi-Fi roles use `wifi_2_4g_` for 2.4 GHz and `wifi_5g_` for 5 GHz.

### Internet

| Role | Entity id | Used for |
|---|---|---|
| `download` | `sensor.<prefix>total_download_speed` | Download gauge and history (Mbit/s) |
| `upload` | `sensor.<prefix>total_upload_speed` | Upload gauge and history (Mbit/s) |
| `sessionDownload` | `sensor.<prefix>session_download` | Data downloaded during the WAN session |
| `sessionUpload` | `sensor.<prefix>session_upload` | Data uploaded during the WAN session |
| `connectedTime` | `sensor.<prefix>connected_time` | WAN connection time |
| `publicIp` | `sensor.<prefix>public_ip` | Public IP |
| `wanIp` | `sensor.<prefix>wan_ip` | WAN IP |
| `protocol` | `sensor.<prefix>protocol` | WAN protocol |

### Router

| Role | Entity id | Used for |
|---|---|---|
| `wanGateway` | `sensor.<prefix>gateway` | WAN gateway |
| `dns` | `sensor.<prefix>dns` | DNS |
| `firmware` | `sensor.<prefix>firmware_version` | Firmware version |
| `uptime` | `sensor.<prefix>uptime` | Uptime |
| `cpu` | `sensor.<prefix>cpu_usage` | CPU usage bar |
| `ram` | `sensor.<prefix>ram_usage` | RAM usage bar |
| `localTime` | `sensor.<prefix>local_time` | Router clock |
| `lanIp` | `sensor.<prefix>lan_ip` | LAN IP |
| `lanMac` | `sensor.<prefix>lan_mac` | LAN MAC |
| `subnet` | `sensor.<prefix>subnet_mask` | LAN subnet mask |
| `reboot` | `button.<prefix>reboot` | Reboot button (confirmation) |

### Wi-Fi

| Role | Entity id | Used for |
|---|---|---|
| `smartConnect` | `switch.<prefix>smart_connect` | Smart Connect switch |
| `wifi2gSsid` | `sensor.<prefix>wifi_2_4g_ssid` | 2.4 GHz: SSID |
| `wifi2gChannel` | `sensor.<prefix>wifi_2_4g_channel` | 2.4 GHz: Current channel |
| `wifi2gClients` | `sensor.<prefix>wifi_2_4g_clients` | 2.4 GHz: Connected Wi-Fi clients |
| `wifi2gEnabled` | `switch.<prefix>wifi_2_4g_enabled` | 2.4 GHz: Radio switch |
| `wifi2gHidden` | `switch.<prefix>wifi_2_4g_hidden_network` | 2.4 GHz: Hidden network switch |
| `wifi2gIsolate` | `switch.<prefix>wifi_2_4g_separate_clients` | 2.4 GHz: Client isolation switch |
| `wifi2gChannelSelect` | `select.<prefix>wifi_2_4g_channel` | 2.4 GHz: Channel selector |
| `wifi2gMode` | `select.<prefix>wifi_2_4g_mode` | 2.4 GHz: Mode selector |
| `wifi2gWidth` | `select.<prefix>wifi_2_4g_channel_width` | 2.4 GHz: Channel width selector |
| `wifi2gPower` | `select.<prefix>wifi_2_4g_transmit_power` | 2.4 GHz: Transmit power selector |
| `wifi5gSsid` | `sensor.<prefix>wifi_5g_ssid` | 5 GHz: SSID |
| `wifi5gChannel` | `sensor.<prefix>wifi_5g_channel` | 5 GHz: Current channel |
| `wifi5gClients` | `sensor.<prefix>wifi_5g_clients` | 5 GHz: Connected Wi-Fi clients |
| `wifi5gEnabled` | `switch.<prefix>wifi_5g_enabled` | 5 GHz: Radio switch |
| `wifi5gHidden` | `switch.<prefix>wifi_5g_hidden_network` | 5 GHz: Hidden network switch |
| `wifi5gIsolate` | `switch.<prefix>wifi_5g_separate_clients` | 5 GHz: Client isolation switch |
| `wifi5gChannelSelect` | `select.<prefix>wifi_5g_channel` | 5 GHz: Channel selector |
| `wifi5gMode` | `select.<prefix>wifi_5g_mode` | 5 GHz: Mode selector |
| `wifi5gWidth` | `select.<prefix>wifi_5g_channel_width` | 5 GHz: Channel width selector |
| `wifi5gPower` | `select.<prefix>wifi_5g_transmit_power` | 5 GHz: Transmit power selector |

### Devices

| Role | Entity id | Used for |
|---|---|---|
| `totalClients` | `sensor.<prefix>total_clients` | Total clients tile |
| `wiredClients` | `sensor.<prefix>wired_clients` | Wired clients tile |
| `meshClients` | `sensor.<prefix>mesh_devices_connected` | Mesh devices tile |
| `topDownHost` | `sensor.<prefix>top_downloader_hostname` | Top downloader name |
| `topDownSpeed` | `sensor.<prefix>top_downloader_speed` | Top downloader speed |
| `topUpHost` | `sensor.<prefix>top_uploader_hostname` | Top uploader name |
| `topUpSpeed` | `sensor.<prefix>top_uploader_speed` | Top uploader speed |

### VPN

| Role | Entity id | Used for |
|---|---|---|
| `vpnEnabled` | `switch.<prefix>vpn_enabled` | VPN switch |
| `vpnSite` | `switch.<prefix>vpn_site_to_site` | Site-to-site switch |
| `vpnClients` | `sensor.<prefix>vpn_clients` | Connected VPN clients |
| `vpnProtocol` | `sensor.<prefix>vpn_protocol` | VPN protocol (read-only) |
| `vpnPolicy` | `select.<prefix>vpn_policy` | Policy selector |
| `vpnAccess` | `select.<prefix>vpn_client_access` | Client access selector |
| `vpnRule` | `select.<prefix>vpn_default_rule` | Default rule selector |

### WISP

| Role | Entity id | Used for |
|---|---|---|
| `wispStatus` | `sensor.<prefix>wisp_status` | WISP status |
| `wispEnabled` | `switch.<prefix>wisp_enabled` | WISP switch |
| `wispNetwork` | `select.<prefix>wisp_network` | Network selector |
| `wispScan` | `button.<prefix>wisp_scan` | Scan button |
| `wispConnect` | `button.<prefix>wisp_connect` | Connect button (confirmation) |

### Connected devices

Every `device_tracker` entity of the `cudy_router` platform attached to the router's config entry is listed under **Devices** as connected (`home`) or disconnected. Its name comes from the `hostname` attribute, then `friendly_name`.

### Entities of the integration not used by the card

`device_count`, `lan_arp_entries`, `ip_start`, `ip_end`, `leasetime`, `preferred_dns`, `default_gateway`, `wan_subnet_mask`, `top_downloader_mac`, `top_uploader_mac`, `auto_update`, `auto_update_time`, `wisp_password`. Any of them can still be displayed by assigning it to a role with `entities:`.

Entities that are not created by the `cudy_router` integration (template helpers, command line sensors, even when attached to the router device) are ignored unless assigned with `entities:`.
