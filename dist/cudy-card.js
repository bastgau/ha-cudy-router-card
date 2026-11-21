/*
 * Cudy Router Card for Home Assistant
 * ===================================
 * Lovelace card for the "cudy_router" integration.
 *
 * Derived from Freebox Card by KroFR (https://github.com/KroFR/freebox-ha-card).
 * License: MIT
 */

const CARD_VERSION = "0.1.0";
const CUDY_PLATFORM = "cudy_router";
const SECTIONS = ["internet", "system", "wifi", "devices", "vpn", "wisp"];
const SECTION_ICONS = { internet: "mdi:speedometer", system: "mdi:router-network", wifi: "mdi:wifi", devices: "mdi:devices", vpn: "mdi:vpn", wisp: "mdi:access-point-network" };

/* ---------------------------------------------------------------------- */
/*  Languages                                                             */
/* ---------------------------------------------------------------------- */
const TRANSLATIONS = {
	en: {
		internet: "Internet", system: "Router", wifi: "Wi-Fi", devices: "Devices", vpn: "VPN", wisp: "WISP",
		download: "Download", upload: "Upload", live_bandwidth: "Live bandwidth", bandwidth_history: "Bandwidth history",
		no_history: "No history available", unavailable: "Unavailable", of: "of",
		public_ip: "Public IP", wan_ip: "WAN IP", protocol: "Protocol", connected_time: "Connected for", session_download: "Session download",
		session_upload: "Session upload", gateway: "Gateway", dns: "DNS",
		firmware: "Firmware", uptime: "Uptime", cpu: "CPU", ram: "RAM", lan_ip: "LAN IP", lan_mac: "LAN MAC", subnet: "Subnet mask", local_time: "Router time",
		reboot: "Reboot", reboot_router: "Reboot the router",
		band_2g: "2.4 GHz", band_5g: "5 GHz", ssid: "SSID", channel: "Channel", clients: "Clients", enabled: "Enabled", hidden: "Hidden network",
		separate_clients: "Client isolation", mode: "Mode", width: "Channel width", power: "Transmit power", smart_connect: "Smart Connect",
		total_clients: "Total clients", wired_clients: "Wired", wifi_clients: "Wi-Fi", mesh_devices: "Mesh devices",
		top_downloader: "Top downloader", top_uploader: "Top uploader", connected: "Connected", disconnected: "Disconnected", total: "Total",
		vpn_enabled: "VPN enabled", vpn_clients: "VPN clients", vpn_protocol: "Protocol", vpn_policy: "Policy", vpn_access: "Client access",
		vpn_rule: "Default rule", vpn_site: "Site-to-site",
		wisp_status: "Status", wisp_enabled: "WISP enabled", wisp_network: "Network", wisp_scan: "Scan", wisp_connect: "Connect",
		confirm_toggle_on: "Turn on “{name}”?", confirm_toggle_off: "Turn off “{name}”?", confirm_select: "Change “{name}” to “{value}”?",
		confirm_reboot: "Reboot the router? The network will be unavailable for a few minutes.", confirm_press: "Run “{name}”?",
		no_device: "No Cudy router found. Select a device in the card editor.", loading: "Loading…",
		expand_section: "Expand section", collapse_section: "Collapse section", d: "d", h: "h", min: "min",
	},
	fr: {
		internet: "Internet", system: "Routeur", wifi: "Wi-Fi", devices: "Appareils", vpn: "VPN", wisp: "WISP",
		download: "Téléchargement", upload: "Envoi", live_bandwidth: "Débit en direct", bandwidth_history: "Historique du débit",
		no_history: "Aucun historique disponible", unavailable: "Indisponible", of: "de",
		public_ip: "IP publique", wan_ip: "IP WAN", protocol: "Protocole", connected_time: "Connecté depuis", session_download: "Téléchargé (session)",
		session_upload: "Envoyé (session)", gateway: "Passerelle", dns: "DNS",
		firmware: "Firmware", uptime: "Disponibilité", cpu: "CPU", ram: "RAM", lan_ip: "IP LAN", lan_mac: "MAC LAN", subnet: "Masque de sous-réseau", local_time: "Heure du routeur",
		reboot: "Redémarrer", reboot_router: "Redémarrer le routeur",
		band_2g: "2,4 GHz", band_5g: "5 GHz", ssid: "SSID", channel: "Canal", clients: "Clients", enabled: "Activé", hidden: "Réseau masqué",
		separate_clients: "Isolation des clients", mode: "Mode", width: "Largeur de canal", power: "Puissance d'émission", smart_connect: "Smart Connect",
		total_clients: "Clients au total", wired_clients: "Filaires", wifi_clients: "Wi-Fi", mesh_devices: "Appareils mesh",
		top_downloader: "Plus gros téléchargement", top_uploader: "Plus gros envoi", connected: "Connectés", disconnected: "Déconnectés", total: "Total",
		vpn_enabled: "VPN activé", vpn_clients: "Clients VPN", vpn_protocol: "Protocole", vpn_policy: "Politique", vpn_access: "Accès des clients",
		vpn_rule: "Règle par défaut", vpn_site: "Site à site",
		wisp_status: "Statut", wisp_enabled: "WISP activé", wisp_network: "Réseau", wisp_scan: "Scanner", wisp_connect: "Connecter",
		confirm_toggle_on: "Activer « {name} » ?", confirm_toggle_off: "Désactiver « {name} » ?", confirm_select: "Passer « {name} » sur « {value} » ?",
		confirm_reboot: "Redémarrer le routeur ? Le réseau sera indisponible quelques minutes.", confirm_press: "Lancer « {name} » ?",
		no_device: "Aucun routeur Cudy trouvé. Sélectionnez un appareil dans l'éditeur de la card.", loading: "Chargement…",
		expand_section: "Développer la section", collapse_section: "Réduire la section", d: "j", h: "h", min: "min",
	},
};

function resolveLanguage(hass, configured = "auto") {
	if (configured !== "auto" && TRANSLATIONS[configured]) return configured;
	const language = (hass?.locale?.language || hass?.language || "en").toLowerCase().split("-")[0];
	return TRANSLATIONS[language] ? language : "en";
}

/* ---------------------------------------------------------------------- */
/*  Entity roles                                                          */
/*  Everything comes from hass.entities / hass.devices, which every user  */
/*  can read (no admin-only websocket call). The scope is the router      */
/*  device (device_id) and the platform "cudy_router". A role is "domain:slug":  */
/*   1. translation_key === slug, when the integration sets one;          */
/*   2. entity_id === "<domain>.<device prefix><slug>", the prefix being   */
/*      learned from the reboot button;                                    */
/*   3. the shortest entity_id ending with "_<slug>".                      */
/*  Renaming an entity's display name changes nothing. Renaming an         */
/*  entity_id can be handled with the "entities:" override.               */
/* ---------------------------------------------------------------------- */
const ROLES = {
	download: "sensor:total_download_speed", upload: "sensor:total_upload_speed",
	sessionDownload: "sensor:session_download", sessionUpload: "sensor:session_upload",
	connectedTime: "sensor:connected_time", publicIp: "sensor:public_ip", wanIp: "sensor:wan_ip",
	protocol: "sensor:protocol", wanGateway: "sensor:gateway", dns: "sensor:dns",
	firmware: "sensor:firmware_version", uptime: "sensor:uptime", cpu: "sensor:cpu_usage",
	ram: "sensor:ram_usage", localTime: "sensor:local_time",
	lanIp: "sensor:lan_ip", lanMac: "sensor:lan_mac", subnet: "sensor:subnet_mask",
	reboot: "button:reboot",
	totalClients: "sensor:total_clients", wiredClients: "sensor:wired_clients", meshClients: "sensor:mesh_devices_connected",
	topDownHost: "sensor:top_downloader_hostname", topDownSpeed: "sensor:top_downloader_speed",
	topUpHost: "sensor:top_uploader_hostname", topUpSpeed: "sensor:top_uploader_speed",
	smartConnect: "switch:smart_connect",
	vpnEnabled: "switch:vpn_enabled", vpnSite: "switch:vpn_site_to_site", vpnClients: "sensor:vpn_clients",
	vpnProtocol: "sensor:vpn_protocol", vpnPolicy: "select:vpn_policy", vpnAccess: "select:vpn_client_access",
	vpnRule: "select:vpn_default_rule",
	wispStatus: "sensor:wisp_status", wispEnabled: "switch:wisp_enabled", wispNetwork: "select:wisp_network",
	wispScan: "button:wisp_scan", wispConnect: "button:wisp_connect",
};
// Role prefix used in the card ("2g", "5g") and the band as written in the entity names.
for (const [band, slug] of [["2g", "2_4g"], ["5g", "5g"]]) {
	Object.assign(ROLES, {
		[`wifi${band}Ssid`]: `sensor:wifi_${slug}_ssid`, [`wifi${band}Channel`]: `sensor:wifi_${slug}_channel`,
		[`wifi${band}Clients`]: `sensor:wifi_${slug}_clients`,
		[`wifi${band}Enabled`]: `switch:wifi_${slug}_enabled`, [`wifi${band}Hidden`]: `switch:wifi_${slug}_hidden_network`,
		[`wifi${band}Isolate`]: `switch:wifi_${slug}_separate_clients`,
		[`wifi${band}ChannelSelect`]: `select:wifi_${slug}_channel`, [`wifi${band}Mode`]: `select:wifi_${slug}_mode`,
		[`wifi${band}Width`]: `select:wifi_${slug}_channel_width`, [`wifi${band}Power`]: `select:wifi_${slug}_transmit_power`,
	});
}

const DEFAULTS = {
	name: "",
	language: "auto",
	section_order: [...SECTIONS],
	show_internet: true, show_system: true, show_wifi: true, show_devices: true, show_vpn: true, show_wisp: false,
	show_header: true, show_card_background: true, show_bandwidth_history: true, show_live_metrics: true,
	show_reboot_button: true, show_controls: true,
	history_hours: 24,
};
const STRING_FIELDS = ["name", "device_id"];
const NUMBER_FIELDS = ["download_bandwidth", "upload_bandwidth", "history_hours"];
const BOOLEAN_FIELDS = Object.keys(DEFAULTS).filter((key) => typeof DEFAULTS[key] === "boolean");

/* ---------------------------------------------------------------------- */
/*  Main card                                                             */
/* ---------------------------------------------------------------------- */
class CudyRouterCard extends HTMLElement {
	static getConfigElement() { return document.createElement("cudy-router-card-editor"); }
	static getStubConfig() { return {}; }

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._index = null;
		this._indexEntities = null;
		this._signature = "";
		this._collapsed = {};
		this._open = {};
		this._history = { key: "", loadedAt: 0, loading: false, series: {} };
		this.shadowRoot.addEventListener("click", (event) => this._onClick(event));
		this.shadowRoot.addEventListener("change", (event) => this._onChange(event));
	}

	setConfig(config) {
		const source = config && typeof config === "object" ? config : {};
		const safe = {};
		for (const key of STRING_FIELDS) if (typeof source[key] === "string") safe[key] = source[key].slice(0, 512);
		for (const key of NUMBER_FIELDS) {
			const value = Number.parseFloat(source[key]);
			if (Number.isFinite(value) && value > 0) safe[key] = value;
		}
		for (const key of BOOLEAN_FIELDS) if (typeof source[key] === "boolean") safe[key] = source[key];
		if (source.language === "auto" || TRANSLATIONS[source.language]) safe.language = source.language;
		if (Array.isArray(source.section_order)) safe.section_order = [...new Set(source.section_order.filter((key) => SECTIONS.includes(key)))];
		safe.entities = {};
		if (source.entities && typeof source.entities === "object") {
			for (const [role, entityId] of Object.entries(source.entities))
				if (role in ROLES && this._isEntityId(entityId)) safe.entities[role] = entityId;
		}
		this._config = { ...DEFAULTS, ...safe };
		this._index = null;
		this._signature = "";
		this._loadCollapsed();
		this._render();
	}

	set hass(hass) {
		this._hass = hass;
		const signature = this._computeSignature();
		if (signature === this._signature) return;
		this._signature = signature;
		this._render();
	}

	getCardSize() { return 6; }

	/* ----- helpers ----- */
	_isEntityId(value) { return typeof value === "string" && /^[a-z0-9_]+\.[a-z0-9_]+$/.test(value); }
	_esc(value) {
		return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
	}
	_lang() { return resolveLanguage(this._hass, this._config?.language || "auto"); }
	_t(key, params = {}) {
		const text = TRANSLATIONS[this._lang()][key] ?? TRANSLATIONS.en[key] ?? key;
		return text.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
	}
	_locale() { return this._hass?.locale?.language || this._hass?.language || this._lang(); }
	_number(value, digits = 1) {
		return new Intl.NumberFormat(this._locale(), { maximumFractionDigits: digits }).format(value);
	}

	/* ----- device & role resolution (hass.entities / hass.devices, no admin needed) ----- */
	_ownEntries() { return Object.values(this._hass?.entities || {}).filter((entry) => entry.platform === CUDY_PLATFORM); }
	_isReboot(entry) { return entry.entity_id.startsWith("button.") && (entry.translation_key === "reboot" || /_reboot$/.test(entry.entity_id)); }

	/** Router device: configured, or the first device exposing the router "reboot" button. */
	_deviceId() {
		if (this._config?.device_id) return this._config.device_id;
		return this._ownEntries().find((entry) => entry.device_id && this._isReboot(entry))?.device_id || "";
	}

	_resolveRole(mine, prefix, key) {
		const [domain, slug] = key.split(":");
		const inDomain = mine.filter((entry) => entry.entity_id.startsWith(`${domain}.`));
		const byKey = inDomain.find((entry) => entry.translation_key === slug);
		if (byKey) return byKey.entity_id;
		const exact = prefix ? inDomain.find((entry) => entry.entity_id === `${domain}.${prefix}${slug}`) : undefined;
		if (exact) return exact.entity_id;
		const objectId = (entry) => entry.entity_id.split(".")[1];
		return inDomain.filter((entry) => objectId(entry) === slug || objectId(entry).endsWith(`_${slug}`))
			.sort((a, b) => objectId(a).length - objectId(b).length)[0]?.entity_id;
	}

	/** Build { role: entity_id } for the selected router device, plus its connected-device trackers. */
	_buildIndex() {
		const entities = this._hass?.entities;
		if (this._index && this._indexEntities === entities) return this._index;
		const deviceId = this._deviceId();
		const entryId = this._hass?.devices?.[deviceId]?.primary_config_entry;
		const own = this._ownEntries();
		const mine = own.filter((entry) => entry.device_id === deviceId && !entry.entity_id.startsWith("device_tracker."));
		const reboot = mine.find((entry) => this._isReboot(entry));
		const prefix = reboot ? reboot.entity_id.split(".")[1].replace(/reboot$/, "") : "";
		const roles = {};
		for (const [role, key] of Object.entries(ROLES)) {
			const entityId = this._resolveRole(mine, prefix, key);
			if (entityId) roles[role] = entityId;
		}
		Object.assign(roles, this._config.entities || {});
		const trackers = entryId ? own.filter((entry) => entry.entity_id.startsWith("device_tracker.") && this._hass.devices?.[entry.device_id]?.primary_config_entry === entryId) : [];
		this._index = { deviceId, entryId, roles, trackers };
		this._indexEntities = entities;
		return this._index;
	}

	_e(role) { const id = this._buildIndex().roles[role]; return id && this._hass?.states?.[id] ? id : ""; }
	_state(role) { const id = this._e(role); return id ? this._hass.states[id] : undefined; }
	_value(role) {
		const state = this._state(role);
		return state && !["unknown", "unavailable", ""].includes(state.state) ? state.state : undefined;
	}
	_numeric(role) { const value = Number.parseFloat(this._value(role)); return Number.isFinite(value) ? value : undefined; }

	_computeSignature() {
		if (!this._hass || !this._config) return "";
		const index = this._buildIndex();
		const ids = [...Object.values(index.roles), ...index.trackers.map((entry) => entry.entity_id)];
		const states = ids.map((id) => { const state = this._hass.states[id]; return state ? [id, state.state, state.attributes?.unit_of_measurement || "", state.attributes?.options?.length || 0] : [id, null]; });
		return JSON.stringify({ config: this._config, lang: this._lang(), dark: Boolean(this._hass.themes?.darkMode), device: index.deviceId, states });
	}

	/* ----- formatting ----- */
	_bits(value, unit) {
		const numeric = Number.parseFloat(value);
		if (!Number.isFinite(numeric)) return undefined;
		const factors = { "bit/s": 1, "kbit/s": 1e3, "Mbit/s": 1e6, "Gbit/s": 1e9, "B/s": 8, "kB/s": 8e3, "MB/s": 8e6, "GB/s": 8e9, "KiB/s": 8192, "MiB/s": 8388608 };
		const factor = factors[String(unit || "").trim()];
		return factor === undefined ? undefined : Math.max(0, numeric * factor);
	}
	_speed(role) {
		const state = this._state(role);
		const bits = this._bits(state?.state, state?.attributes?.unit_of_measurement);
		if (bits === undefined) return this._t("unavailable");
		return bits >= 1e9 ? `${this._number(bits / 1e9, 2)} Gbit/s` : `${this._number(bits / 1e6, 2)} Mbit/s`;
	}
	_dataSize(role) {
		const state = this._state(role);
		const value = Number.parseFloat(state?.state);
		if (!Number.isFinite(value)) return undefined;
		const factors = { B: 1, kB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4 };
		const bytes = value * (factors[state.attributes?.unit_of_measurement] ?? 1e6);
		for (const [unit, size] of [["TB", 1e12], ["GB", 1e9], ["MB", 1e6]]) if (bytes >= size) return `${this._number(bytes / size, 2)} ${unit}`;
		return `${this._number(bytes / 1e3, 0)} kB`;
	}
	_duration(seconds) {
		if (!Number.isFinite(seconds)) return undefined;
		const days = Math.floor(seconds / 86400), hours = Math.floor((seconds % 86400) / 3600), minutes = Math.floor((seconds % 3600) / 60);
		if (days) return `${days} ${this._t("d")} ${hours} ${this._t("h")}`;
		if (hours) return `${hours} ${this._t("h")} ${minutes} ${this._t("min")}`;
		return `${minutes} ${this._t("min")}`;
	}
	_durationOf(role) {
		const state = this._state(role);
		const value = Number.parseFloat(this._value(role));
		if (!Number.isFinite(value)) return undefined;
		const factors = { s: 1, min: 60, h: 3600, d: 86400 };
		return this._duration(value * (factors[state.attributes?.unit_of_measurement] ?? 1));
	}
	_text(role) { return this._value(role); }
	_percent(role) { const value = this._numeric(role); return value === undefined ? undefined : `${this._number(value, 0)} %`; }

	/* ----- UI building blocks ----- */
	_moreInfo(role) { const id = this._e(role); return id ? ` data-more-info="${this._esc(id)}" role="button" tabindex="0"` : ""; }

	_row(icon, label, value, role) {
		if (value === undefined || value === null || value === "") return "";
		return `<div class="row"${role ? this._moreInfo(role) : ""}><ha-icon icon="${icon}"></ha-icon><span class="label">${this._esc(label)}</span><strong>${this._esc(value)}</strong></div>`;
	}

	_tile(icon, label, value, role, tone = "") {
		if (value === undefined || value === null || value === "") return "";
		return `<div class="tile ${tone}"${role ? this._moreInfo(role) : ""}><ha-icon icon="${icon}"></ha-icon><strong>${this._esc(value)}</strong><span>${this._esc(label)}</span></div>`;
	}

	_bar(icon, label, role) {
		const value = this._numeric(role);
		if (value === undefined) return "";
		const percent = Math.min(Math.max(value, 0), 100);
		const color = percent >= 90 ? "var(--error-color, #f44336)" : percent >= 70 ? "var(--warning-color, #ff9800)" : "var(--success-color, #4caf50)";
		return `<div class="bar"${this._moreInfo(role)}><div class="bar-head"><ha-icon icon="${icon}"></ha-icon><span>${this._esc(label)}</span><strong>${this._number(percent, 0)} %</strong></div><div class="bar-track"><div class="bar-fill" style="width:${percent}%;background:${color}"></div></div></div>`;
	}

	_switch(role, label) {
		const state = this._value(role);
		if (state === undefined || !this._config.show_controls) return state === undefined ? "" : this._row("mdi:toggle-switch-outline", label, state === "on" ? "On" : "Off", role);
		return `<label class="row control"><ha-icon icon="mdi:toggle-switch-outline"></ha-icon><span class="label">${this._esc(label)}</span><input type="checkbox" class="toggle" data-action="toggle" data-role="${role}" data-label="${this._esc(label)}" ${state === "on" ? "checked" : ""}></label>`;
	}

	_select(role, label) {
		const state = this._state(role);
		const options = state?.attributes?.options;
		if (!state || ["unknown", "unavailable"].includes(state.state)) return "";
		if (!this._config.show_controls || !Array.isArray(options)) return this._row("mdi:format-list-bulleted", label, state.state, role);
		const items = options.map((option) => `<option value="${this._esc(option)}" ${option === state.state ? "selected" : ""}>${this._esc(option)}</option>`).join("");
		return `<label class="row control"><ha-icon icon="mdi:format-list-bulleted"></ha-icon><span class="label">${this._esc(label)}</span><select data-action="select" data-role="${role}" data-label="${this._esc(label)}">${items}</select></label>`;
	}

	_button(role, label, icon, confirmText) {
		if (!this._e(role) || !this._config.show_controls) return "";
		return `<button type="button" class="action" data-action="press" data-role="${role}" data-label="${this._esc(label)}" ${confirmText ? `data-confirm="${this._esc(confirmText)}"` : ""}><ha-icon icon="${icon}"></ha-icon>${this._esc(label)}</button>`;
	}

	_metric(role, type) {
		const state = this._state(role);
		if (!state) return "";
		const bits = this._bits(state.state, state.attributes?.unit_of_measurement);
		const speed = bits === undefined ? 0 : bits / 1e6;
		const maximum = Number.parseFloat(type === "download" ? this._config.download_bandwidth : this._config.upload_bandwidth);
		const hasMax = Number.isFinite(maximum) && maximum > 0;
		const percent = hasMax ? Math.min((speed / maximum) * 100, 100) : 0;
		let color = type === "download" ? "#2196f3" : "#4caf50";
		if (hasMax && percent >= 80) color = "#f44336"; else if (hasMax && percent >= 50) color = "#ff9800";
		const subtitle = hasMax ? `${this._number(percent, 1)} % ${this._t("of")} ${maximum >= 1000 ? `${this._number(maximum / 1000, 1)} Gbit/s` : `${this._number(maximum, 0)} Mbit/s`}` : "";
		const radius = 16, circumference = 2 * Math.PI * radius;
		return `<button type="button" class="metric ${type}" data-more-info="${this._esc(this._e(role))}">
			<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="${radius}" class="metric-track"></circle><circle cx="20" cy="20" r="${radius}" class="metric-value" style="stroke:${color};stroke-dasharray:${circumference};stroke-dashoffset:${circumference * (1 - percent / 100)}"></circle></svg>
			<span class="metric-icon"><ha-icon icon="mdi:arrow-${type === "download" ? "down" : "up"}" style="color:${color}"></ha-icon></span>
			<div class="metric-copy"><strong>${this._esc(this._speed(role))}</strong>${subtitle ? `<small>${this._esc(subtitle)}</small>` : ""}</div>
		</button>`;
	}

	/* ----- bandwidth history (HA history API, 5-minute averages) ----- */
	_historyHours() { return Math.min(Math.max(Number.parseInt(this._config.history_hours, 10) || 24, 1), 168); }

	async _loadHistory() {
		const ids = ["download", "upload"].map((role) => this._e(role)).filter(Boolean);
		if (!this._hass?.callApi || !this._config.show_bandwidth_history || !ids.length) return;
		const hours = this._historyHours();
		const key = `${ids.join("|")}|${hours}`;
		if (this._history.loading || (this._history.key === key && Date.now() - this._history.loadedAt < 300000)) return;
		this._history = { ...this._history, key, loading: true };
		let series = {};
		try {
			const end = new Date(), start = new Date(end.getTime() - hours * 3600000);
			const query = new URLSearchParams({ filter_entity_id: ids.join(","), end_time: end.toISOString(), significant_changes_only: "0" });
			const history = await this._hass.callApi("GET", `history/period/${start.toISOString()}?${query}`);
			for (const id of ids) {
				const group = (Array.isArray(history) ? history : []).find((items) => Array.isArray(items) && items.some((item) => item?.entity_id === id)) || [];
				const fallbackUnit = this._hass.states[id]?.attributes?.unit_of_measurement;
				series[id] = group.map((item) => {
					const bits = this._bits(item.state, item.attributes?.unit_of_measurement || fallbackUnit);
					const timestamp = Date.parse(item.last_updated || item.last_changed);
					return bits === undefined || !Number.isFinite(timestamp) ? null : { timestamp, value: bits / 1e6 };
				}).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp);
			}
		} catch (error) {
			console.error("[cudy-router-card] Unable to load history", error);
		}
		this._history = { key, loadedAt: Date.now(), loading: false, series };
		this._render();
	}

	_bucket(points, start, end, duration = 300000) {
		const buckets = new Map();
		for (const point of points) {
			if (point.timestamp < start || point.timestamp > end) continue;
			const key = Math.floor(point.timestamp / duration) * duration;
			const bucket = buckets.get(key) || { sum: 0, count: 0 };
			bucket.sum += point.value; bucket.count += 1; buckets.set(key, bucket);
		}
		return [...buckets.entries()].sort(([a], [b]) => a - b).map(([key, bucket]) => ({ timestamp: Math.min(key + duration / 2, end), value: bucket.sum / bucket.count }));
	}

	_historyChart() {
		if (!this._config.show_bandwidth_history) return "";
		const hours = this._historyHours(), end = Date.now(), start = end - hours * 3600000;
		const downloadId = this._e("download"), uploadId = this._e("upload");
		const down = this._bucket(this._history.series[downloadId] || [], start, end);
		const up = this._bucket(this._history.series[uploadId] || [], start, end);
		const title = `<div class="subsection-title">${this._esc(this._t("bandwidth_history"))} <small>${hours} h</small></div>`;
		if (!down.length && !up.length) return `<div class="history">${title}<div class="history-empty">${this._esc(this._t(this._history.loading ? "loading" : "no_history"))}</div></div>`;
		const width = 600, height = 150;
		const peak = Math.max(1, ...down.map((p) => p.value), ...up.map((p) => p.value));
		const step = peak <= 10 ? 5 : peak <= 50 ? 10 : Math.pow(10, Math.floor(Math.log10(peak)));
		const maximum = Math.ceil(peak / step) * step;
		const path = (points) => points.map((p, i) => `${i ? "L" : "M"}${(((p.timestamp - start) / (end - start)) * width).toFixed(1)},${(height - (p.value / maximum) * height).toFixed(1)}`).join(" ");
		const area = (points) => points.length ? `${path(points)} L${(((points.at(-1).timestamp - start) / (end - start)) * width).toFixed(1)},${height} L${(((points[0].timestamp - start) / (end - start)) * width).toFixed(1)},${height} Z` : "";
		const ticks = Array.from({ length: 5 }, (_, i) => i / 4);
		const grid = ticks.map((r) => `<line class="grid" x1="0" y1="${(height * r).toFixed(1)}" x2="${width}" y2="${(height * r).toFixed(1)}"></line>`).join("");
		const labels = [...ticks].reverse().map((r) => `<span style="top:${(1 - r) * 100}%">${this._number(maximum * r, 0)}</span>`).join("");
		const clock = Array.from({ length: 5 }, (_, i) => { const date = new Date(start + ((end - start) * i) / 4); return `<span>${this._esc(date.toLocaleTimeString(this._locale(), { hour: "2-digit", minute: "2-digit" }))}</span>`; }).join("");
		return `<div class="history">${title}<div class="history-chart"><div class="history-unit">Mbit/s</div><div class="history-y">${labels}</div>
			<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${grid}
				${down.length ? `<path d="${area(down)}" fill="#2196f3" fill-opacity=".25"></path><path d="${path(down)}" class="line" stroke="#2196f3"></path>` : ""}
				${up.length ? `<path d="${area(up)}" fill="#4caf50" fill-opacity=".25"></path><path d="${path(up)}" class="line" stroke="#4caf50"></path>` : ""}
			</svg><div class="history-x">${clock}</div></div></div>`;
	}

	/* ----- sections ----- */
	_panel(key, body) {
		if (!body.trim()) return "";
		const collapsed = this._collapsed[key] === true;
		return `<section class="panel${collapsed ? " section-collapsed" : ""}" data-section-key="${key}">
			<div class="section-title" role="button" tabindex="0" aria-expanded="${!collapsed}" aria-label="${this._esc(this._t(collapsed ? "expand_section" : "collapse_section"))}" data-toggle-section="${key}"><ha-icon icon="${SECTION_ICONS[key]}"></ha-icon>${this._esc(this._t(key))}<ha-icon class="chevron" icon="mdi:chevron-${collapsed ? "right" : "up"}"></ha-icon></div>
			<div class="section-body">${body}</div></section>`;
	}

	_internetSection() {
		const metrics = [this._metric("download", "download"), this._metric("upload", "upload")].filter(Boolean).join("");
		const live = this._config.show_live_metrics && metrics ? `<div class="subsection-title">${this._esc(this._t("live_bandwidth"))}</div><div class="metrics">${metrics}</div>` : "";
		const rows = [
			this._row("mdi:ip-network", this._t("public_ip"), this._text("publicIp"), "publicIp"),
			this._row("mdi:ip", this._t("wan_ip"), this._text("wanIp"), "wanIp"),
			this._row("mdi:lan-connect", this._t("protocol"), this._text("protocol"), "protocol"),
			this._row("mdi:timer-outline", this._t("connected_time"), this._durationOf("connectedTime"), "connectedTime"),
			this._row("mdi:download", this._t("session_download"), this._dataSize("sessionDownload"), "sessionDownload"),
			this._row("mdi:upload", this._t("session_upload"), this._dataSize("sessionUpload"), "sessionUpload"),
		].join("");
		if (!live && !rows.trim() && !this._e("download")) return "";
		setTimeout(() => this._loadHistory(), 0);
		return this._panel("internet", `${live}${this._historyChart()}<div class="rows">${rows}</div>`);
	}

	_systemSection() {
		const bars = [this._bar("mdi:cpu-64-bit", this._t("cpu"), "cpu"), this._bar("mdi:memory", this._t("ram"), "ram")].join("");
		const rows = [
			this._row("mdi:chip", this._t("firmware"), this._text("firmware"), "firmware"),
			this._row("mdi:clock-outline", this._t("uptime"), this._durationOf("uptime"), "uptime"),
			this._row("mdi:ip-network-outline", this._t("lan_ip"), this._text("lanIp"), "lanIp"),
			this._row("mdi:ethernet", this._t("lan_mac"), this._text("lanMac"), "lanMac"),
			this._row("mdi:subnet", this._t("subnet"), this._text("subnet"), "subnet"),
			this._row("mdi:gate", this._t("gateway"), this._text("wanGateway"), "wanGateway"),
			this._row("mdi:dns", this._t("dns"), this._text("dns"), "dns"),
			this._row("mdi:clock-time-four-outline", this._t("local_time"), this._text("localTime"), "localTime"),
		].join("");
		const reboot = this._config.show_reboot_button ? this._button("reboot", this._t("reboot"), "mdi:restart", this._t("confirm_reboot")) : "";
		return this._panel("system", `${bars ? `<div class="bars">${bars}</div>` : ""}<div class="rows">${rows}</div>${reboot ? `<div class="actions">${reboot}</div>` : ""}`);
	}

	_wifiBand(band) {
		const r = (name) => `wifi${band}${name}`;
		const clients = this._numeric(r("Clients"));
		const head = [this._text(r("Ssid")) && this._row("mdi:wifi", this._t("ssid"), this._text(r("Ssid")), r("Ssid")),
			this._row("mdi:numeric", this._t("channel"), this._text(r("Channel")), r("Channel")),
			this._row("mdi:account-multiple", this._t("clients"), clients === undefined ? undefined : String(clients), r("Clients"))].join("");
		const controls = [this._switch(r("Enabled"), this._t("enabled")), this._switch(r("Hidden"), this._t("hidden")), this._switch(r("Isolate"), this._t("separate_clients")),
			this._select(r("Mode"), this._t("mode")), this._select(r("ChannelSelect"), this._t("channel")), this._select(r("Width"), this._t("width")), this._select(r("Power"), this._t("power"))].join("");
		if (!head.trim() && !controls.trim()) return "";
		return `<div class="band"><div class="subsection-title">${this._esc(this._t(`band_${band}`))}</div><div class="rows">${head}${controls}</div></div>`;
	}

	_wifiSection() {
		const bands = ["2g", "5g"].map((band) => this._wifiBand(band)).join("");
		const smart = this._switch("smartConnect", this._t("smart_connect"));
		return this._panel("wifi", `<div class="bands">${bands}</div>${smart ? `<div class="rows">${smart}</div>` : ""}`);
	}

	_trackerLists() {
		const { trackers } = this._buildIndex();
		const groups = { home: [], away: [] };
		for (const entry of trackers) {
			const state = this._hass.states[entry.entity_id];
			if (!state) continue;
			const name = state.attributes?.hostname || state.attributes?.friendly_name || entry.entity_id;
			(state.state === "home" ? groups.home : groups.away).push({ name, id: entry.entity_id, mac: state.attributes?.mac || "", ip: state.attributes?.ip || "" });
		}
		const sort = (a, b) => String(a.name).localeCompare(String(b.name), this._lang(), { sensitivity: "base" });
		groups.home.sort(sort); groups.away.sort(sort);
		return groups;
	}

	_trackerDetails(key, label, items) {
		if (!items.length) return "";
		const rows = items.map((item) => `<li data-more-info="${this._esc(item.id)}" role="button" tabindex="0"><ha-icon icon="mdi:${key === "home" ? "lan-connect" : "lan-disconnect"}"></ha-icon><span>${this._esc(item.name)}</span><small>${this._esc(item.ip || item.mac)}</small></li>`).join("");
		return `<details data-tracker-list="${key}" ${this._open[key] ? "open" : ""}><summary>${this._esc(label)} (${items.length})</summary><ul>${rows}</ul></details>`;
	}

	_devicesSection() {
		const trackers = this._trackerLists();
		const total = trackers.home.length + trackers.away.length;
		const tiles = [
			this._tile("mdi:devices", this._t("total_clients"), this._text("totalClients"), "totalClients"),
			this._tile("mdi:ethernet-cable", this._t("wired_clients"), this._text("wiredClients"), "wiredClients"),
			this._tile("mdi:wifi", this._t("wifi_clients"), (() => { const sum = ["2g", "5g"].map((band) => this._numeric(`wifi${band}Clients`)).filter((v) => v !== undefined); return sum.length ? String(sum.reduce((a, b) => a + b, 0)) : undefined; })(), "wifi5gClients"),
			this._tile("mdi:graph", this._t("mesh_devices"), this._text("meshClients"), "meshClients"),
		].join("");
		const top = [
			this._row("mdi:arrow-down-bold", this._t("top_downloader"), this._text("topDownHost") && `${this._text("topDownHost")} · ${this._speed("topDownSpeed")}`, "topDownHost"),
			this._row("mdi:arrow-up-bold", this._t("top_uploader"), this._text("topUpHost") && `${this._text("topUpHost")} · ${this._speed("topUpSpeed")}`, "topUpHost"),
		].join("");
		const trackerTiles = total ? `${this._tile("mdi:lan-connect", this._t("connected"), String(trackers.home.length), "", "ok")}${this._tile("mdi:lan-disconnect", this._t("disconnected"), String(trackers.away.length), "", "off")}` : "";
		const lists = `${this._trackerDetails("home", this._t("connected"), trackers.home)}${this._trackerDetails("away", this._t("disconnected"), trackers.away)}`;
		return this._panel("devices", `${tiles || trackerTiles ? `<div class="tiles">${tiles}${trackerTiles}</div>` : ""}<div class="rows">${top}</div>${lists}`);
	}

	_vpnSection() {
		const rows = [
			this._switch("vpnEnabled", this._t("vpn_enabled")),
			this._row("mdi:lan-connect", this._t("vpn_protocol"), this._text("vpnProtocol"), "vpnProtocol"),
			this._row("mdi:account-network", this._t("vpn_clients"), this._text("vpnClients"), "vpnClients"),
			this._switch("vpnSite", this._t("vpn_site")),
			this._select("vpnPolicy", this._t("vpn_policy")), this._select("vpnAccess", this._t("vpn_access")), this._select("vpnRule", this._t("vpn_rule")),
		].join("");
		return this._panel("vpn", `<div class="rows">${rows}</div>`);
	}

	_wispSection() {
		const rows = [
			this._row("mdi:access-point-network", this._t("wisp_status"), this._text("wispStatus"), "wispStatus"),
			this._switch("wispEnabled", this._t("wisp_enabled")),
			this._select("wispNetwork", this._t("wisp_network")),
		].join("");
		const actions = [this._button("wispScan", this._t("wisp_scan"), "mdi:magnify"), this._button("wispConnect", this._t("wisp_connect"), "mdi:connection", this._t("confirm_press", { name: this._t("wisp_connect") }))].join("");
		return this._panel("wisp", `<div class="rows">${rows}</div>${actions.trim() ? `<div class="actions">${actions}</div>` : ""}`);
	}

	/* ----- render ----- */
	_render() {
		if (!this._config) return;
		const config = this._config;
		let content;
		if (!this._hass) content = `<div class="empty">${this._esc(this._t("loading"))}</div>`;
		else if (!this._buildIndex().deviceId) content = `<div class="empty">${this._esc(this._t("no_device"))}</div>`;
		else {
			const order = [...new Set([...config.section_order, ...SECTIONS])];
			const builders = { internet: () => this._internetSection(), system: () => this._systemSection(), wifi: () => this._wifiSection(), devices: () => this._devicesSection(), vpn: () => this._vpnSection(), wisp: () => this._wispSection() };
			content = order.filter((key) => config[`show_${key}`]).map((key) => builders[key]()).join("") || `<div class="empty">${this._esc(this._t("loading"))}</div>`;
		}
		const header = config.show_header ? `<div class="header"><ha-icon icon="mdi:router-wireless"></ha-icon>${this._esc(config.name || "Cudy")}</div>` : "";
		this.shadowRoot.innerHTML = `<style>${this._styles()}</style><ha-card class="${config.show_card_background ? "" : "no-background"}">${header}${content}</ha-card>`;
		this.shadowRoot.querySelectorAll("details[data-tracker-list]").forEach((element) => element.addEventListener("toggle", () => { this._open[element.dataset.trackerList] = element.open; }));
	}

	/* ----- interactions ----- */
	_collapsedKey() { return `cudy-router-card:collapsed:${this._config?.device_id || "auto"}`; }
	_loadCollapsed() { try { this._collapsed = JSON.parse(localStorage.getItem(this._collapsedKey()) || "{}") || {}; } catch (_error) { this._collapsed = {}; } }
	_saveCollapsed() { try { localStorage.setItem(this._collapsedKey(), JSON.stringify(this._collapsed)); } catch (_error) { /* storage unavailable */ } }

	_onClick(event) {
		const path = event.composedPath();
		const find = (selector) => path.find((node) => node instanceof Element && node.matches?.(selector));
		const action = find("[data-action='press']");
		if (action) { event.stopPropagation(); this._press(action); return; }
		if (find("input[data-action], select[data-action]")) return;
		const title = find("[data-toggle-section]");
		if (title) { const key = title.dataset.toggleSection; this._collapsed = { ...this._collapsed, [key]: !this._collapsed[key] }; this._saveCollapsed(); this._render(); return; }
		const info = find("[data-more-info]");
		if (info && this._isEntityId(info.dataset.moreInfo)) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: info.dataset.moreInfo }, bubbles: true, composed: true }));
	}

	_press(button) {
		const entityId = this._e(button.dataset.role);
		if (!entityId) return;
		if (button.dataset.confirm && !window.confirm(button.dataset.confirm)) return;
		this._hass.callService("button", "press", { entity_id: entityId });
	}

	_onChange(event) {
		const target = event.target;
		const action = target?.dataset?.action;
		if (!["toggle", "select"].includes(action)) return;
		const entityId = this._e(target.dataset.role);
		if (!entityId) return;
		if (action === "toggle") {
			const message = this._t(target.checked ? "confirm_toggle_on" : "confirm_toggle_off", { name: target.dataset.label });
			if (window.confirm(message)) this._hass.callService("switch", target.checked ? "turn_on" : "turn_off", { entity_id: entityId });
			else target.checked = !target.checked;
			return;
		}
		const message = this._t("confirm_select", { name: target.dataset.label, value: target.value });
		if (window.confirm(message)) this._hass.callService("select", "select_option", { entity_id: entityId, option: target.value });
		else { this._signature = ""; this._render(); }
	}

	_styles() {
		return `
		:host { display:block; }
		ha-card { padding:16px; display:flex; flex-direction:column; gap:14px; overflow:hidden; }
		ha-card.no-background { background:transparent; box-shadow:none; border:none; padding:0; }
		.header { display:flex; align-items:center; gap:10px; font-size:1.25rem; font-weight:600; }
		.header ha-icon { color:#009fe3; }
		.empty { color:var(--secondary-text-color); padding:12px 0; text-align:center; }
		.panel { background:var(--secondary-background-color, rgba(127,127,127,.08)); border-radius:12px; padding:12px 14px; }
		.section-title { display:flex; align-items:center; gap:8px; font-weight:600; cursor:pointer; user-select:none; }
		.section-title .chevron { margin-left:auto; color:var(--secondary-text-color); }
		.section-collapsed .section-body { display:none; }
		.section-body { margin-top:10px; display:flex; flex-direction:column; gap:12px; }
		.subsection-title { font-size:.8rem; text-transform:uppercase; letter-spacing:.04em; color:var(--secondary-text-color); margin-bottom:6px; }
		.subsection-title small { text-transform:none; margin-left:6px; }
		.rows { display:flex; flex-direction:column; }
		.row { display:flex; align-items:center; gap:10px; padding:6px 0; border-bottom:1px solid var(--divider-color, rgba(127,127,127,.2)); min-height:24px; }
		.row:last-child { border-bottom:none; }
		.row ha-icon { color:var(--secondary-text-color); --mdc-icon-size:20px; flex:none; }
		.row .label { flex:1; color:var(--secondary-text-color); }
		.row strong { text-align:right; overflow-wrap:anywhere; }
		.row[data-more-info], .tile[data-more-info], .bar[data-more-info], li[data-more-info] { cursor:pointer; }
		.control select { max-width:55%; background:var(--card-background-color); color:var(--primary-text-color); border:1px solid var(--divider-color); border-radius:6px; padding:4px 6px; font:inherit; }
		.control input.toggle { width:40px; height:22px; accent-color:var(--primary-color); cursor:pointer; }
		.metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; }
		.metric { position:relative; display:flex; align-items:center; gap:10px; padding:8px; border:none; border-radius:12px; background:var(--card-background-color); color:inherit; cursor:pointer; font:inherit; text-align:left; }
		.metric svg { width:54px; height:54px; transform:rotate(-90deg); flex:none; }
		.metric-track { fill:none; stroke:var(--divider-color, rgba(127,127,127,.25)); stroke-width:4; }
		.metric-value { fill:none; stroke-width:4; stroke-linecap:round; transition:stroke-dashoffset .6s ease; }
		.metric-icon { position:absolute; left:8px; top:8px; width:54px; height:54px; display:flex; align-items:center; justify-content:center; }
		.metric-copy { display:flex; flex-direction:column; min-width:0; }
		.metric-copy strong { font-size:1.05rem; }
		.metric-copy small { color:var(--secondary-text-color); }
		.history-chart { position:relative; height:170px; margin-left:34px; }
		.history-chart svg { width:100%; height:150px; display:block; }
		.history-chart .grid { stroke:var(--divider-color, rgba(127,127,127,.25)); stroke-width:1; vector-effect:non-scaling-stroke; }
		.history-chart .line { fill:none; stroke-width:1.6; vector-effect:non-scaling-stroke; }
		.history-y { position:absolute; left:-34px; top:0; height:150px; width:30px; font-size:.7rem; color:var(--secondary-text-color); }
		.history-y span { position:absolute; right:0; transform:translateY(-50%); }
		.history-unit { position:absolute; left:-34px; top:-16px; font-size:.7rem; color:var(--secondary-text-color); }
		.history-x { display:flex; justify-content:space-between; font-size:.7rem; color:var(--secondary-text-color); margin-top:4px; }
		.history-empty { color:var(--secondary-text-color); padding:16px 0; text-align:center; }
		.bars { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; }
		.bar-head { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
		.bar-head span { flex:1; color:var(--secondary-text-color); }
		.bar-track { height:8px; border-radius:4px; background:var(--divider-color, rgba(127,127,127,.25)); overflow:hidden; }
		.bar-fill { height:100%; border-radius:4px; transition:width .4s ease; }
		.bands { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; }
		.tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:10px; }
		.tile { display:flex; flex-direction:column; align-items:center; gap:2px; padding:10px 6px; border-radius:12px; background:var(--card-background-color); text-align:center; }
		.tile strong { font-size:1.3rem; }
		.tile span { font-size:.8rem; color:var(--secondary-text-color); }
		.tile.ok ha-icon { color:var(--success-color, #4caf50); } .tile.off ha-icon { color:var(--secondary-text-color); }
		details { border-top:1px solid var(--divider-color, rgba(127,127,127,.2)); padding-top:6px; }
		summary { cursor:pointer; padding:4px 0; font-weight:500; }
		ul { list-style:none; margin:4px 0 0; padding:0; }
		li { display:flex; align-items:center; gap:8px; padding:4px 0; }
		li span { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
		li small { color:var(--secondary-text-color); }
		li ha-icon { --mdc-icon-size:18px; color:var(--secondary-text-color); }
		.actions { display:flex; gap:8px; flex-wrap:wrap; }
		.action { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); font:inherit; cursor:pointer; }
		.action:hover { background:var(--primary-color); color:var(--text-primary-color, #fff); }
		`;
	}
}

/* ---------------------------------------------------------------------- */
/*  Visual editor (ha-form)                                               */
/* ---------------------------------------------------------------------- */
class CudyRouterCardEditor extends HTMLElement {
	setConfig(config) { this._config = config || {}; this._render(); }
	set hass(hass) { this._hass = hass; if (this._form) this._form.hass = hass; }

	_schema() {
		const toggles = ["show_header", "show_card_background", "show_live_metrics", "show_bandwidth_history", "show_controls", "show_reboot_button", ...SECTIONS.map((key) => `show_${key}`)];
		return [
			{ name: "device_id", selector: { device: { integration: CUDY_PLATFORM } } },
			{ name: "name", selector: { text: {} } },
			{ name: "language", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Auto" }, ...Object.keys(TRANSLATIONS).map((value) => ({ value, label: value.toUpperCase() }))] } } },
			{ name: "history_hours", selector: { number: { min: 1, max: 168, mode: "box", unit_of_measurement: "h" } } },
			{ name: "download_bandwidth", selector: { number: { min: 1, mode: "box", unit_of_measurement: "Mbit/s" } } },
			{ name: "upload_bandwidth", selector: { number: { min: 1, mode: "box", unit_of_measurement: "Mbit/s" } } },
			{ type: "grid", name: "", schema: toggles.map((name) => ({ name, selector: { boolean: {} } })) },
		];
	}

	_render() {
		if (!this._form) {
			this._form = document.createElement("ha-form");
			this._form.computeLabel = (schema) => schema.name.replace(/^show_/, "show ").replace(/_/g, " ");
			this._form.addEventListener("value-changed", (event) => {
				event.stopPropagation();
				const config = { ...this._config, ...event.detail.value };
				for (const key of Object.keys(config)) if (config[key] === "" || config[key] === undefined || config[key] === DEFAULTS[key]) delete config[key];
				this._config = config;
				this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
			});
			this.appendChild(this._form);
		}
		this._form.hass = this._hass;
		this._form.schema = this._schema();
		this._form.data = { ...DEFAULTS, ...this._config };
	}
}

customElements.define("cudy-router-card", CudyRouterCard);
customElements.define("cudy-router-card-editor", CudyRouterCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
	type: "cudy-router-card",
	name: "Cudy Router Card",
	description: "Status and controls for a Cudy router (cudy_router integration).",
	preview: false,
	documentationURL: "https://github.com/bastgau/ha-cudy-router-card",
});
console.info(`%c CUDY-ROUTER-CARD %c ${CARD_VERSION} `, "color:#fff;background:#009fe3;font-weight:700", "color:#009fe3;background:#fff;font-weight:700");
