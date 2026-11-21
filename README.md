# Cudy Router Card

Card Lovelace pour l'intégration `cudy_router` : débit en direct, historique, état du routeur, Wi-Fi (2,4 / 5 GHz), appareils connectés, VPN et WISP, avec commandes (switches, listes, redémarrage) protégées par une confirmation.

Dérivée de [Freebox Card](https://github.com/KroFR/freebox-ha-card) de KroFR (MIT).

## Détection des entités

Tout est lu dans `hass.entities` et `hass.devices` : la card fonctionne pour **tous les utilisateurs**, pas seulement les administrateurs. Tu choisis l'**appareil** routeur (`device_id` ; sans lui, le premier routeur Cudy trouvé est utilisé). Dans cet appareil, pour chaque rôle, la card essaie dans l'ordre :

1. la `translation_key` de l'entité (si l'intégration en définit une) ;
2. l'`entity_id` construit avec le préfixe de l'appareil et le rôle (le bouton `button.<préfixe>reboot` donne le préfixe) ;
3. l'`entity_id` le plus court qui se termine par le nom du rôle.

Renommer le *nom affiché* d'une entité ne change rien. Si un `entity_id` est renommé, forcer le rôle avec `entities:`.

## Installation

HACS → Dépôts personnalisés → `https://github.com/bastgau/ha-cudy-router-card` (type *Tableau de bord*), puis ajouter la ressource `/hacsfiles/ha-cudy-router-card/cudy-card.js`.

## Configuration

```yaml
type: custom:cudy-router-card
device_id: 233737be76ee725f69d9ec7cec80f9ae   # facultatif, détecté automatiquement
name: Cudy
download_bandwidth: 300      # Mbit/s, échelle des jauges
upload_bandwidth: 100
history_hours: 24
section_order: [internet, system, wifi, devices, vpn, wisp]
show_wisp: false
show_controls: true          # false = lecture seule
entities:                    # surcharge facultative par rôle
  publicIp: sensor.public_ip
```

Voir [README_EN.md](README_EN.md) pour le tableau complet des options. Les rôles sont listés dans `ROLES` (`dist/cudy-card.js`).
