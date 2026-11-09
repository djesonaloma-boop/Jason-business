/* ==========================================================
   JASON BUSINESS — icônes SVG vectorielles
   Remplace automatiquement les emojis par de vraies icônes,
   dans le HTML existant ET dans le contenu ajouté par le JS.
   Le texte d'origine reste présent (masqué) : la logique de
   la page qui lit textContent/innerText continue de marcher.
   ========================================================== */
(function () {
  'use strict';

  /* ---------- dessins (grille 24x24, trait arrondi) ---------- */
  var P = {
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'x': '<path d="M18 6 6 18M6 6l12 12"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    'ban': '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    'alert': '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    'loader': '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
    'refresh': '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    'circle-dollar': '<circle cx="12" cy="12" r="10"/><path d="M15.5 9c-.4-1-1.6-1.6-3.5-1.6-2 0-3.3.9-3.3 2.2 0 3 6.8 1.3 6.8 4.4 0 1.3-1.3 2.2-3.5 2.2-2 0-3.3-.6-3.9-1.8M12 5.6v1.8M12 16.6v1.8"/>',
    'banknote': '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
    'exchange': '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
    'credit-card': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    'wallet': '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M16 13h2"/>',
    'receipt': '<path d="M4 2v20l3-2 2.5 2L12 20l2.5 2L17 20l3 2V2l-3 2-2.5-2L12 4 9.5 2 7 4Z"/><path d="M8 9h8M8 13h8"/>',
    'crown': '<path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 12H5Z"/>',
    'star': '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1Z"/>',
    'sparkles': '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
    'gem': '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6M2 9h20"/>',
    'flame': '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2 0-3-1-5 1-8Z"/>',
    'zap': '<path d="M13 2 3 14h9l-1 8 10-12h-9Z"/>',
    'rocket': '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    'smartphone': '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    'phone': '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    'laptop': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
    'image': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    'palette': '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.9 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.4-.4-.7-.4-1.1 0-.9.8-1.6 1.6-1.6H17a4 4 0 0 0 4-4c0-4.4-4-8.5-9-8.5Z"/><circle cx="7.5" cy="11" r=".8"/><circle cx="10" cy="7" r=".8"/><circle cx="15" cy="7.5" r=".8"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3.5"/>',
    'video': '<path d="m22 8-6 4 6 4Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    'mic': '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
    'headphones': '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2ZM3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2Z"/>',
    'music': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'volume': '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    'volume-x': '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="m22 9-6 6M16 9l6 6"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    'bell-off': '<path d="M8.7 3A6 6 0 0 1 18 8c0 2.7.4 4.6.9 6M17 17H3s3-2 3-9c0-.8.1-1.5.4-2.2M10.3 21a1.9 1.9 0 0 0 3.4 0M2 2l20 20"/>',
    'megaphone': '<path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    'message': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'hand': '<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16.6a2 2 0 0 1 3-2.7L8 15"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
    'arrow-down': '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'bar-chart': '<path d="M3 3v18h18"/><path d="M8 17v-6M13 17V7M18 17v-3"/>',
    'trending-up': '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    'cart': '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.1 3H5l2.7 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 7H6"/>',
    'bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    'package': '<path d="m7.5 4.3 9 5.2M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    'gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    'tag': '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z"/><circle cx="7.5" cy="7.5" r=".6"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>',
    'signal': '<path d="M4 20v-3M9 20v-7M14 20V9M19 20V4"/>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'unlock': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    'shield': '<path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"/>',
    'key': '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    'id-card': '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4M5.5 17c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2"/>',
    'eye': '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 5.1-5.9M9.9 5.2A9.1 9.1 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'trash': '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
    'pencil': '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    'clipboard': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    'file': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    'folder': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    'paperclip': '<path d="m21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z"/><path d="M6.5 17H20v4H6.5a2.5 2.5 0 0 1 0-4Z"/>',
    'graduation': '<path d="m22 9-10-5L2 9l10 5Z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>',
    'newspaper': '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8Z"/>',
    'plug': '<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
    'battery': '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>',
    'bot': '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6M2 14h2M20 14h2M9 13v2M15 13v2"/>',
    'cpu': '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    'layers': '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9Z"/>',
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    'building': '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    'utensils': '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    'plane': '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z"/>',
    'tower': '<circle cx="12" cy="9" r="2"/><path d="M12 11 8 22M12 11l4 11M9.5 18h5M6.3 6.3a8 8 0 0 0 0 11.4M17.7 17.7a8 8 0 0 0 0-11.4"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'moon': '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
    'heart': '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    'gamepad': '<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
    'soccer': '<circle cx="12" cy="12" r="10"/><path d="m12 8 4 3-1.5 5h-5L8 11ZM12 2v6M16 11l5-1.5M14.5 16l3 4M9.5 16l-3 4M8 11 3 9.5"/>',
    'slot': '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M9 4v14M15 4v14M7 21h10"/>',
    'wheel': '<circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="1.5"/><path d="M12 3v14M5 10h14M7 5l10 10M17 5 7 15M8 22l4-5 4 5"/>',
    'dice': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r=".9"/><circle cx="15.5" cy="15.5" r=".9"/><circle cx="12" cy="12" r=".9"/>',
    'dot': '<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/>',
    'hash': '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    'ruler': '<path d="M3 8h18v8H3Z"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
    'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
    'cherry': '<path d="M12 3c-2 3-3 6-3 11M12 3c1 3 4 6 5 11M12 3c2 0 4 0 6 1"/><circle cx="8" cy="17" r="4"/><circle cx="17" cy="17" r="4"/>',
    'rainbow': '<path d="M2 18a10 10 0 0 1 20 0M6 18a6 6 0 0 1 12 0M10 18a2 2 0 0 1 4 0"/>',
    'bomb': '<circle cx="11" cy="14" r="7"/><path d="m15.5 9.5 3-3M18.5 6.5l1-3M18.5 6.5l3 1M18.5 6.5l2.5-2.5"/>',
    'clover': '<circle cx="9" cy="8.5" r="3.5"/><circle cx="15" cy="8.5" r="3.5"/><circle cx="9" cy="14.5" r="3.5"/><circle cx="15" cy="14.5" r="3.5"/><path d="M12 15c0 3 1 5 3 7"/>',
    'square': '<rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" stroke="none"/>',
    'dice-1': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    'dice-2': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    'dice-3': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    'dice-4': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    'dice-5': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>',
    'dice-6': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="7.5" r="1" fill="currentColor"/><circle cx="16" cy="7.5" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="16.5" r="1" fill="currentColor"/><circle cx="16" cy="16.5" r="1" fill="currentColor"/>',
    'door': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'
  };

  /* ---------- emoji -> icône ---------- */
  var G = {
    'check-circle': '✅', 'check': '✓✔', 'x-circle': '❌', 'x': '✕', 'ban': '🚫', 'alert': '⚠', 'info': 'ℹ',
    'loader': '⏳', 'refresh': '🔄↻', 'clock': '⏰', 'calendar': '📅',
    'circle-dollar': '💰', 'banknote': '💵', 'arrow-up-right': '💸↗', 'exchange': '💱',
    'credit-card': '💳', 'wallet': '👛', 'receipt': '🧾',
    'crown': '👑', 'star': '⭐', 'sparkles': '✨✦', 'gem': '💎💠', 'flame': '🔥', 'zap': '⚡💥',
    'rocket': '🚀', 'smartphone': '📱📲', 'phone': '📞', 'laptop': '💻', 'image': '🖼', 'palette': '🎨',
    'camera': '📷📸', 'video': '📹🎥🎬', 'mic': '🎙🎤', 'headphones': '🎧', 'music': '🎵🎶',
    'volume': '🔊', 'volume-x': '🔇', 'bell': '🔔', 'bell-off': '🔕', 'megaphone': '📢📣',
    'message': '💬🗣', 'users': '👥', 'user': '👤👨', 'hand': '👋🧤',
    'arrow-right': '➤➡👉', 'arrow-left': '⬅', 'arrow-up': '⬆', 'arrow-down': '⬇',
    'upload': '📤', 'download': '📥', 'plus': '➕', 'bar-chart': '📊', 'trending-up': '📈',
    'cart': '🛒', 'bag': '🛍', 'package': '📦', 'gift': '🎁', 'tag': '🏷',
    'globe': '🌐🌍🛰', 'signal': '📶', 'lock': '🔒🔐', 'unlock': '🔓', 'shield': '🛡', 'key': '🔑', 'id-card': '🪪',
    'eye': '👁', 'eye-off': '🙈', 'search': '🔍🔎', 'trash': '🗑', 'pencil': '✏✍📝',
    'clipboard': '📋', 'file': '📄', 'folder': '📁📂', 'paperclip': '📎', 'save': '💾', 'database': '🗄',
    'book': '📚', 'graduation': '🎓', 'newspaper': '📰', 'plug': '🔌', 'battery': '🔋',
    'bot': '🤖', 'cpu': '🧠', 'layers': '🧩', 'lightbulb': '💡', 'wrench': '🛠🏗', 'settings': '⚙',
    'building': '🏢🏨⛪', 'home': '🏠', 'utensils': '🍽', 'plane': '✈', 'tower': '🗼',
    'sun': '☀', 'moon': '🌙🌑', 'heart': '❤🤍💙', 'gamepad': '🎮', 'soccer': '⚽', 'slot': '🎰',
    'wheel': '🎡', 'cherry': '🍒', 'rainbow': '🌈', 'bomb': '💣', 'clover': '🍀', 'dice': '🎲', 'hash': '🔢', 'ruler': '📏', 'briefcase': '💼', 'door': '🚪'
  };
  /* pastilles de couleur : emoji -> couleur */
  var DOTS = { '🔴': '#ff4d7a', '🟢': '#2dffb0', '🔵': '#38b6ff' };
  var SQUARES = { '🟫': '#b07a4a', '🟨': '#ffc857' };

  var MAP = {}, VARIANT = {};
  Object.keys(G).forEach(function (name) {
    Array.from(G[name]).forEach(function (ch) { MAP[ch] = name; });
  });
  Object.keys(SQUARES).forEach(function (ch) { MAP[ch] = 'square'; VARIANT[ch] = SQUARES[ch]; });
  for (var d = 1; d <= 6; d++) MAP[String.fromCharCode(0x267F + d)] = 'dice-' + d;
  Object.keys(DOTS).forEach(function (ch) { MAP[ch] = 'dot'; VARIANT[ch] = DOTS[ch]; });
  /* variantes de sens : ❤️ plein rouge, 🤍 contour, 💙 plein bleu */
  VARIANT['❤'] = 'fill-red'; VARIANT['💙'] = 'fill-blue'; VARIANT['🤍'] = 'outline';

  var chars = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });
  var RE = new RegExp('(' + chars.map(function (c) { return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')\\uFE0F?', 'g');
  var STRIP = new RegExp('(?:' + chars.map(function (c) { return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')\\uFE0F?\\s*', 'g');

  var SKIP = 'script,style,textarea,input,option,title,noscript,svg,.ic,[data-no-ic],[contenteditable="true"]';

  function svg(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + P[name] + '</svg>';
  }

  function make(emoji, ch) {
    var name = MAP[ch];
    var s = document.createElement('span');
    s.className = 'ic';
    s.setAttribute('data-n', name);
    var v = VARIANT[ch];
    if (v) {
      if (v.charAt(0) === '#') s.style.color = v; else s.setAttribute('data-v', v);
    }
    s.innerHTML = svg(name);
    /* le texte d'origine reste lisible par le code de la page */
    var t = document.createElement('span');
    t.className = 'ic-t';
    t.textContent = emoji;
    s.appendChild(t);
    return s;
  }

  function convertText(node) {
    var parent = node.parentElement;
    if (!parent) return;
    var txt = node.nodeValue;
    if (!txt || txt.length > 4000) return;
    RE.lastIndex = 0;
    if (!RE.test(txt)) return;
    if (parent.closest(SKIP)) {
      /* <option> : pas de HTML possible, on retire simplement l'emoji */
      if (parent.tagName === 'OPTION') node.nodeValue = txt.replace(STRIP, '');
      return;
    }
    RE.lastIndex = 0;
    var frag = document.createDocumentFragment(), last = 0, m;
    while ((m = RE.exec(txt))) {
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      frag.appendChild(make(m[0], m[1]));
      last = m.index + m[0].length;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { convertText(root); return; }
    if (root.nodeType !== 1) return;
    if (root.closest && root.closest(SKIP) && root.tagName !== 'OPTION') return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), list = [], n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(convertText);
    fixAttrs(root);
  }

  /* attributs (placeholder, title) : pas de HTML possible, on retire l'emoji */
  function fixAttrs(root) {
    if (!root.querySelectorAll) return;
    var els = root.querySelectorAll('[placeholder],[title],[aria-label]');
    for (var i = 0; i < els.length; i++) stripAttrs(els[i]);
    stripAttrs(root);
  }
  function stripAttrs(el) {
    ['placeholder', 'title', 'aria-label'].forEach(function (a) {
      var v = el.getAttribute && el.getAttribute(a);
      if (v) { RE.lastIndex = 0; if (RE.test(v)) el.setAttribute(a, v.replace(STRIP, '')); }
    });
  }

  /* alert / confirm / prompt : messages sans emoji */
  ['alert', 'confirm', 'prompt'].forEach(function (fn) {
    var orig = window[fn];
    if (!orig) return;
    window[fn] = function (msg) {
      var a = Array.prototype.slice.call(arguments);
      if (typeof msg === 'string') a[0] = msg.replace(STRIP, '');
      return orig.apply(window, a);
    };
  });

  var mo = new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r.type === 'childList') {
        for (var j = 0; j < r.addedNodes.length; j++) scan(r.addedNodes[j]);
      } else if (r.type === 'characterData') {
        scan(r.target);
      } else if (r.type === 'attributes') {
        stripAttrs(r.target);
      }
    }
  });
  mo.observe(document, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title'] });

  document.addEventListener('DOMContentLoaded', function () { scan(document.body); });
  window.JBIcons = { scan: scan, svg: svg };
})();
