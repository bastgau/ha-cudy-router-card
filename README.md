# Cudy Router Card

Card Lovelace pour l'intégration `cudy_router` : débit en direct, historique, état du routeur, Wi-Fi (2,4 / 5 GHz), appareils connectés, VPN et WISP, avec commandes (switches, listes, redémarrage) protégées par une confirmation.

Dérivée de [Freebox Card](https://github.com/KroFR/freebox-ha-card) de KroFR (MIT).

## Détection des entités

La card ne s'appuie jamais sur les noms ou entity_id. Tu choisis l'**appareil** routeur (`device_id`) ; les entités sont retrouvées dans le registre : plateforme `cudy_router`, même config entry, suffixe du `unique_id` (`<groupe>-<clé>`, ex. `devices-total_down_speed`). Sans `device_id`, le premier routeur Cudy trouvé est utilisé. Un rôle peut être forcé avec `entities:`.

> Le registre est lu via la commande websocket `config/entity_registry/list`, réservée aux administrateurs.

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
