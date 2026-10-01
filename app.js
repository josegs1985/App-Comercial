/**
 * CRM Comercial Industrial B2B & Oportunidades EPC
 * Empresas, Contactos, Licitaciones EPC y Seguimiento con Notas de Voz y Transcripción
 */

const STORAGE_KEY_COMPANIES = 'crm_industrial_empresas_v3';

// Estado global de la aplicación
let companies = [];
let currentTab = 'dashboard';
let currentSearchTerm = '';
let currentGeoFilter = 'all';
let currentSegmentFilter = 'all';
let currentScopeFilter = 'all';

let selectedCompanyId = null;
let currentCompanySubtab = 'contacts';
let currentLogoBase64 = null;

// Variables para Grabación de Audio y Transcripción de Voz
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBase64 = null;
let recordingTimerInterval = null;
let recordingSeconds = 0;
let isRecording = false;

// Reconocimiento de Voz nativo
let speechRecognition = null;
let isSpeechSupported = false;

// ==========================================
// DATOS DE REFERENCIA INDUSTRIAL (DEMO)
// ==========================================
const INITIAL_COMPANIES = [
  {
    id: 'comp-101',
    name: 'Techint E&C',
    segment: 'Ductos',
    geography: 'Sur',
    website: 'https://www.techint.com',
    description: 'Compañía global de ingeniería y construcción de gran escala para plantas industriales, gasoductos, refinerías y minería.',
    logo: null,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    contacts: [
      {
        id: 'con-1',
        name: 'Ing. Martín Rossi',
        role: 'Director de Licitaciones EPC',
        phone: '+5491145678901',
        email: 'mrossi@techint.com',
        comments: 'Decisor clave en consorcios y compras de equipos de proceso mayor.'
      },
      {
        id: 'con-2',
        name: 'Lic. Valeria Domínguez',
        role: 'Gerente de Contratos y Compras',
        phone: '+5491198765432',
        email: 'vdominguez@techint.com',
        comments: 'Encargada de homologación técnica de proveedores y términos de pago.'
      }
    ],
    opportunities: [
      {
        id: 'opp-1',
        name: 'Gasoducto Troncal Vaca Muerta - Etapa 2 (36")',
        type: 'Licitación Privada',
        scope: 'EPC',
        amount: 145000000,
        deadline: getDateOffsetString(25),
        description: 'Construcción llave en mano de 220 km de ducto troncal de 36 pulgadas con 2 plantas compresoras intermedias.'
      },
      {
        id: 'opp-2',
        name: 'Ingeniería de Detalle Planta de Tratamiento de Gas',
        type: 'Contrato Marco',
        scope: 'E',
        amount: 8500000,
        deadline: getDateOffsetString(45),
        description: 'Desarrollo de maqueta 3D, cálculos hidráulicos y especificaciones de procura para tren de compresión.'
      }
    ],
    followups: [
      {
        id: 'fol-1',
        companyId: 'comp-101',
        companyName: 'Techint E&C',
        contactName: 'Ing. Martín Rossi',
        contactRole: 'Director de Licitaciones EPC',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        channel: 'Reunión Presencial',
        audioData: null,
        transcript: 'Reunión de alineación con el Ing. Rossi. Se analizaron las condiciones del consorcio para la licitación del gasoducto. Nos solicitaron confirmar capacidad de suministro de válvulas y cuadrillas para cruces especiales bajo río.',
        summary: '📌 Puntos Clave: Licitación de 36" y consorcio estratégico.\n🤝 Acuerdos: Enviar matriz de riesgos y disponibilidad de equipos pesados antes del miércoles.\n🎯 Próximo Paso: Reunión de oferta económica el próximo viernes.',
        nextAction: 'Enviar matriz de disponibilidad de cuadrillas y equipos',
        nextDate: getDateOffsetString(2)
      }
    ]
  },
  {
    id: 'comp-102',
    name: 'Iberdrola Renovable',
    segment: 'Transición Energética',
    geography: 'Norte',
    website: 'https://www.iberdrola.mx',
    description: 'Líder en generación de energía renovable, proyectos solares fotovoltaicos a gran escala, parques eólicos e hidrógeno verde.',
    logo: null,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    contacts: [
      {
        id: 'con-3',
        name: 'Mtra. Sofía Calderón',
        role: 'Gerente de Desarrollo de Proyectos Solares',
        phone: '+525541239876',
        email: 'sofia.calderon@iberdrola.com',
        comments: 'Muy receptiva por WhatsApp. Prioriza experiencia en interconexión a CFE/CENACE.'
      }
    ],
    opportunities: [
      {
        id: 'opp-3',
        name: 'Parque Solar Fotovoltaico Sonora 250 MW & Subestación',
        type: 'Licitación Privada',
        scope: 'EPC',
        amount: 88000000,
        deadline: getDateOffsetString(18),
        description: 'BOP eléctrico, hincado de estructuras, montaje de módulos y subestación elevadora en 230 kV.'
      }
    ],
    followups: [
      {
        id: 'fol-2',
        companyId: 'comp-102',
        companyName: 'Iberdrola Renovable',
        contactName: 'Mtra. Sofía Calderón',
        contactRole: 'Gerente de Desarrollo de Proyectos Solares',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        channel: 'Videollamada',
        audioData: null,
        transcript: 'Videollamada para aclarar dudas de las bases técnicas. Aclararon que los inversores serán provistos por Iberdrola y el resto del BOS y montaje es alcance EPC del contratista.',
        summary: '📌 Puntos Clave: Alcance delimitado a BOS + montaje.\n🤝 Acuerdos: Preparar propuesta con cronograma acelerado a 14 meses.\n🎯 Próximo Paso: Entregar oferta antes del vencimiento.',
        nextAction: 'Finalizar estudio geotécnico preliminar para cimentaciones',
        nextDate: getDateOffsetString(5)
      }
    ]
  },
  {
    id: 'comp-103',
    name: 'YPF S.A.',
    segment: 'Oil&Gas',
    geography: 'Sur',
    website: 'https://www.ypf.com',
    description: 'Principal empresa energética argentina de exploración, producción, refinación y comercialización de hidrocarburos.',
    logo: null,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    contacts: [
      {
        id: 'con-4',
        name: 'Ing. Gustavo Benítez',
        role: 'Superintendente de Facilidades de Superficie',
        phone: '+5492994112233',
        email: 'gbenitez@ypf.com',
        comments: 'Localizado en Neuquén. Prefiere reuniones por Teams a primera hora.'
      }
    ],
    opportunities: [
      {
        id: 'opp-4',
        name: 'Batería de Separación Temprana y Batería de Crudo',
        type: 'Licitación Pública',
        scope: 'EPC',
        amount: 42000000,
        deadline: getDateOffsetString(32),
        description: 'Ingeniería, procura de separadores trifásicos y construcción de manifold de producción en bloque Añelo.'
      }
    ],
    followups: []
  },
  {
    id: 'comp-104',
    name: 'Vale Mineração',
    segment: 'Minería',
    geography: 'Brasil',
    website: 'https://www.vale.com',
    description: 'Una de las mayores empresas mineras del mundo, líder en producción de mineral de hierro, pellets y níquel.',
    logo: null,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    contacts: [
      {
        id: 'con-5',
        name: 'Carlos Eduardo Silva',
        role: 'Gerente de Contratação de Engenharia',
        phone: '+5531987651234',
        email: 'carlos.silva@vale.com',
        comments: 'Comunicación en portugués y español. Responsable de compras en Minas Gerais.'
      }
    ],
    opportunities: [
      {
        id: 'opp-5',
        name: 'Sistema de Transporte de Mineral por Correa Overland (8 km)',
        type: 'Licitación Privada',
        scope: 'EPC',
        amount: 65000000,
        deadline: getDateOffsetString(40),
        description: 'Construcción y montaje electromecánico de sistema transportador de alta capacidad y subestación eléctrica asociada.'
      }
    ],
    followups: []
  }
];

// Helper para fecha en formato YYYY-MM-DD
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getDateOffsetString(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatMoney(val) {
  if (!val && val !== 0) return '$0';
  return '$' + Number(val).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' USD';
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderDateHeader();
  renderAllViews();
  initSpeechRecognition();
  registerServiceWorker();
});

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY_COMPANIES);
  if (stored) {
    try {
      companies = JSON.parse(stored);
    } catch (e) {
      companies = [...INITIAL_COMPANIES];
    }
  } else {
    companies = [...INITIAL_COMPANIES];
    saveCompanies();
  }
}

function saveCompanies() {
  localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
}

function renderDateHeader() {
  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  const todayStr = new Date().toLocaleDateString('es-ES', options);
  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);
  }
}

// ==========================================
// NAVEGACIÓN ENTRE PESTAÑAS PRINCIPALES
// ==========================================
function switchTab(tabId) {
  currentTab = tabId;

  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });
  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  const titleEl = document.getElementById('app-title');
  if (tabId === 'dashboard') titleEl.textContent = 'CRM Comercial';
  else if (tabId === 'companies') titleEl.textContent = 'Directorio Empresas';
  else if (tabId === 'opportunities') titleEl.textContent = 'Cartera de Oportunidades';
  else if (tabId === 'settings') titleEl.textContent = 'Ajustes & Respaldo';

  const fab = document.getElementById('main-fab');
  if (tabId === 'settings') {
    fab.style.display = 'none';
  } else {
    fab.style.display = 'flex';
  }

  renderAllViews();
}

function handleFabClick() {
  openGlobalAddActionModal();
}

// ==========================================
// RENDERIZADO GLOBAL
// ==========================================
function renderAllViews() {
  renderDashboard();
  renderCompanies();
  renderOpportunities();
}

// ==========================================
// 1. DASHBOARD
// ==========================================
function renderDashboard() {
  let allOpps = [];
  let allContactsCount = 0;
  let allFollowups = [];

  companies.forEach(comp => {
    if (comp.opportunities) allOpps.push(...comp.opportunities.map(o => ({ ...o, companyName: comp.name, companyId: comp.id })));
    if (comp.contacts) allContactsCount += comp.contacts.length;
    if (comp.followups) allFollowups.push(...comp.followups.map(f => ({ ...f, companyName: comp.name, companyId: comp.id })));
  });

  const totalPipelineVal = allOpps.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const epcOpps = allOpps.filter(o => o.scope === 'EPC');
  const epcTotalVal = epcOpps.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const voiceFollowups = allFollowups.filter(f => f.audioData || (f.transcript && f.transcript.length > 0));

  // KPIs en UI
  document.getElementById('kpi-pipeline-val').textContent = formatMoney(totalPipelineVal);
  document.getElementById('kpi-opps-count').textContent = `${allOpps.length} oportunidades`;

  document.getElementById('kpi-companies-count').textContent = companies.length;
  document.getElementById('kpi-contacts-count').textContent = `${allContactsCount} contactos registrados`;

  document.getElementById('kpi-epc-val').textContent = formatMoney(epcTotalVal);
  document.getElementById('kpi-epc-count').textContent = `${epcOpps.length} proyectos EPC`;

  document.getElementById('kpi-followups-count').textContent = allFollowups.length;
  document.getElementById('kpi-voice-count').textContent = `${voiceFollowups.length} notas registradas`;

  // Oportunidades Próximas a Entregar (Top 3)
  const oppsListEl = document.getElementById('dashboard-upcoming-opps');
  oppsListEl.innerHTML = '';
  const sortedOpps = [...allOpps].sort((a, b) => (a.deadline || '').localeCompare(b.deadline || '')).slice(0, 3);

  if (sortedOpps.length === 0) {
    oppsListEl.innerHTML = '<div class="empty-state"><p>No hay oportunidades registradas aún.</p></div>';
  } else {
    sortedOpps.forEach(opp => {
      oppsListEl.appendChild(createOpportunityCardElement(opp));
    });
  }

  // Últimos Seguimientos (Top 3)
  const followupsListEl = document.getElementById('dashboard-recent-followups');
  followupsListEl.innerHTML = '';
  const sortedFollowups = [...allFollowups].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  if (sortedFollowups.length === 0) {
    followupsListEl.innerHTML = '<div class="empty-state"><p>No hay notas de seguimiento recientes.</p></div>';
  } else {
    sortedFollowups.forEach(fol => {
      followupsListEl.appendChild(createFollowupItemElement(fol));
    });
  }
}

// ==========================================
// 2. DIRECTORIO DE EMPRESAS
// ==========================================
function renderCompanies() {
  const container = document.getElementById('companies-full-list');
  if (!container) return;
  container.innerHTML = '';

  let filtered = [...companies];

  // Filtro por Geografía
  if (currentGeoFilter !== 'all') {
    filtered = filtered.filter(c => c.geography === currentGeoFilter);
  }

  // Filtro por Segmento
  if (currentSegmentFilter !== 'all') {
    filtered = filtered.filter(c => c.segment === currentSegmentFilter);
  }

  // Filtro por Término de Búsqueda
  if (currentSearchTerm.trim() !== '') {
    const term = currentSearchTerm.toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.segment.toLowerCase().includes(term) ||
      c.geography.toLowerCase().includes(term) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      (c.contacts && c.contacts.some(ct => ct.name.toLowerCase().includes(term) || ct.role.toLowerCase().includes(term)))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron empresas con los filtros aplicados.</p>
        <button class="btn btn-sm btn-primary mt-2" onclick="openModal('modal-add-company')">+ Registrar Empresa</button>
      </div>
    `;
    return;
  }

  filtered.forEach(comp => {
    container.appendChild(createCompanyCardElement(comp));
  });
}

function createCompanyCardElement(comp) {
  const card = document.createElement('div');
  card.className = 'company-card';
  card.onclick = () => openCompanyDetails(comp.id);

  const contactCount = comp.contacts ? comp.contacts.length : 0;
  const oppCount = comp.opportunities ? comp.opportunities.length : 0;
  const totalVal = (comp.opportunities || []).reduce((s, o) => s + (Number(o.amount) || 0), 0);

  const segBadgeClass = getSegmentBadgeClass(comp.segment);

  card.innerHTML = `
    <div class="company-card-top">
      <div class="company-logo-avatar">
        ${comp.logo ? `<img src="${comp.logo}" alt="${comp.name}">` : getInitials(comp.name)}
      </div>
      <div class="company-card-headings">
        <h4 class="company-card-name">${escapeHTML(comp.name)}</h4>
        <div class="badges-row">
          <span class="badge-segment ${segBadgeClass}">${escapeHTML(comp.segment)}</span>
          <span class="badge-geo">${escapeHTML(comp.geography)}</span>
        </div>
      </div>
    </div>

    <p class="company-card-desc">${escapeHTML(comp.description || 'Sin descripción registrada.')}</p>

    <div class="company-card-footer">
      <div class="company-counts-pill">
        <span>👥 ${contactCount} contactos</span>
        <span>📑 ${oppCount} proyectos</span>
      </div>
      <span style="font-weight:800; color:var(--primary); font-size:0.85rem;">
        ${formatMoney(totalVal)}
      </span>
    </div>
  `;
  return card;
}

function getSegmentBadgeClass(segment) {
  switch (segment) {
    case 'Power': return 'badge-power';
    case 'Oil&Gas': return 'badge-oilgas';
    case 'Infraestructura': return 'badge-infra';
    case 'Transición Energética': return 'badge-transicion';
    case 'Ductos': return 'badge-ductos';
    case 'Siderurgia': return 'badge-siderurgia';
    case 'Minería': return 'badge-mineria';
    default: return 'badge-otros';
  }
}

function getInitials(name) {
  if (!name) return 'EM';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function handleCompanySearch(val) {
  currentSearchTerm = val;
  const clearBtn = document.getElementById('clear-search-btn');
  if (clearBtn) clearBtn.classList.toggle('hidden', val.length === 0);
  renderCompanies();
}

function clearCompanySearch() {
  document.getElementById('company-search-input').value = '';
  currentSearchTerm = '';
  document.getElementById('clear-search-btn').classList.add('hidden');
  renderCompanies();
}

function filterByGeo(geo, btnEl) {
  currentGeoFilter = geo;
  document.querySelectorAll('#geo-filter-chips .chip').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderCompanies();
}

function filterBySegment(segment, btnEl) {
  currentSegmentFilter = segment;
  document.querySelectorAll('#segment-filter-chips .chip').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderCompanies();
}

// ==========================================
// 3. CARTERA DE OPORTUNIDADES
// ==========================================
function renderOpportunities() {
  const container = document.getElementById('opportunities-full-list');
  if (!container) return;
  container.innerHTML = '';

  let allOpps = [];
  companies.forEach(comp => {
    if (comp.opportunities) {
      allOpps.push(...comp.opportunities.map(o => ({ ...o, companyName: comp.name, companyId: comp.id })));
    }
  });

  if (currentScopeFilter !== 'all') {
    allOpps = allOpps.filter(o => o.scope === currentScopeFilter);
  }

  // Ordenar por fecha límite más cercana
  allOpps.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));

  const totalOppsVal = allOpps.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  document.getElementById('opps-header-total').textContent = formatMoney(totalOppsVal);

  if (allOpps.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No hay oportunidades en este filtro.</p>
        <button class="btn btn-sm btn-primary mt-2" onclick="openModal('modal-add-opportunity')">+ Registrar Oportunidad</button>
      </div>
    `;
    return;
  }

  allOpps.forEach(opp => {
    container.appendChild(createOpportunityCardElement(opp));
  });
}

function filterOppsByScope(scope, segEl) {
  currentScopeFilter = scope;
  document.querySelectorAll('.segmented-control .segment').forEach(s => s.classList.remove('active'));
  if (segEl) segEl.classList.add('active');
  renderOpportunities();
}

function createOpportunityCardElement(opp) {
  const card = document.createElement('div');
  card.className = 'opportunity-card';
  card.onclick = () => {
    if (opp.companyId) {
      openCompanyDetails(opp.companyId);
      switchCompanySubtab('opps');
    }
  };

  const scopeClass = opp.scope === 'EPC' ? 'scope-epc' : (opp.scope === 'E' ? 'scope-e' : 'scope-other');

  card.innerHTML = `
    <div class="opp-card-header">
      <div>
        <h4 class="opp-title">${escapeHTML(opp.name)}</h4>
        <span class="opp-company-ref">🏢 ${escapeHTML(opp.companyName || 'Empresa')} • ${escapeHTML(opp.type)}</span>
      </div>
      <span class="opp-scope-badge ${scopeClass}">${escapeHTML(opp.scope)}</span>
    </div>

    <p class="opp-desc">${escapeHTML(opp.description || 'Sin detalles de alcance registrados.')}</p>

    <div class="opp-footer-meta">
      <span class="opp-amount">${formatMoney(opp.amount)}</span>
      <span class="opp-deadline">
        📅 Entrega: ${formatDate(opp.deadline)}
      </span>
    </div>
  `;
  return card;
}

// ==========================================
// 4. DETALLE DE EMPRESA Y SUBPESTAÑAS
// ==========================================
function openCompanyDetails(companyId) {
  selectedCompanyId = companyId;
  const comp = companies.find(c => c.id === companyId);
  if (!comp) return;

  // Cabecera Hero
  const logoBox = document.getElementById('detail-hero-logo');
  if (comp.logo) {
    logoBox.innerHTML = `<img src="${comp.logo}" alt="${comp.name}">`;
  } else {
    logoBox.innerHTML = getInitials(comp.name);
  }

  document.getElementById('detail-company-name').textContent = comp.name;
  
  const segEl = document.getElementById('detail-company-segment');
  segEl.textContent = comp.segment;
  segEl.className = `badge-segment ${getSegmentBadgeClass(comp.segment)}`;

  document.getElementById('detail-company-geo').textContent = comp.geography;

  const webLink = document.getElementById('detail-company-website');
  const webText = document.getElementById('detail-website-text');
  if (comp.website) {
    webLink.href = comp.website.startsWith('http') ? comp.website : 'https://' + comp.website;
    webLink.style.display = 'inline-flex';
    webText.textContent = comp.website.replace(/^https?:\/\//, '');
  } else {
    webLink.style.display = 'none';
  }

  document.getElementById('detail-company-desc').textContent = comp.description || 'Sin descripción adicional registrada para esta empresa.';

  // Conteos en subtags
  document.getElementById('count-subtab-contacts').textContent = comp.contacts ? comp.contacts.length : 0;
  document.getElementById('count-subtab-opps').textContent = comp.opportunities ? comp.opportunities.length : 0;
  document.getElementById('count-subtab-followup').textContent = comp.followups ? comp.followups.length : 0;

  // Renderizar contenido de las tres subpestañas
  renderCompanyContacts(comp);
  renderCompanyOpps(comp);
  renderCompanyFollowups(comp);

  switchCompanySubtab(currentCompanySubtab);
  openModal('modal-company-details');
}

function switchCompanySubtab(subtabId) {
  currentCompanySubtab = subtabId;
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtabId);
  });
  document.querySelectorAll('.subtab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  const targetPane = document.getElementById(`company-pane-${subtabId}`);
  if (targetPane) targetPane.classList.add('active');
}

// Subpestaña 1: Contactos
function renderCompanyContacts(comp) {
  const container = document.getElementById('company-contacts-list');
  container.innerHTML = '';

  if (!comp.contacts || comp.contacts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No hay personas de contacto registradas para esta empresa.</p>
        <button class="btn btn-sm btn-primary mt-2" onclick="openAddContactModal()">+ Agregar Contacto</button>
      </div>
    `;
    return;
  }

  comp.contacts.forEach(contact => {
    const card = document.createElement('div');
    card.className = 'contact-card';

    const cleanPhone = (contact.phone || '').replace(/[^0-9+]/g, '');

    card.innerHTML = `
      <div class="contact-card-header">
        <div>
          <h4 class="contact-card-name">${escapeHTML(contact.name)}</h4>
          <span class="contact-card-role">${escapeHTML(contact.role)}</span>
        </div>
        <button class="btn-text-action text-danger" onclick="deleteContact('${contact.id}')" title="Eliminar">🗑</button>
      </div>

      ${contact.comments ? `<div class="contact-card-comments">💡 ${escapeHTML(contact.comments)}</div>` : ''}

      <div class="contact-actions-bar">
        ${cleanPhone ? `
          <a href="https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('Hola ' + contact.name + ', te contacto en relación con nuestro proyecto con ' + comp.name)}" target="_blank" class="contact-pill-btn wa">
            💬 WhatsApp
          </a>
          <a href="tel:${cleanPhone}" class="contact-pill-btn call">
            📞 Llamar
          </a>
        ` : ''}
        ${contact.email ? `
          <a href="mailto:${contact.email}?subject=${encodeURIComponent('Seguimiento Comercial - ' + comp.name)}" class="contact-pill-btn mail">
            ✉️ Correo
          </a>
        ` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

// Subpestaña 2: Oportunidades de la Empresa
function renderCompanyOpps(comp) {
  const container = document.getElementById('company-opps-list');
  container.innerHTML = '';

  if (!comp.opportunities || comp.opportunities.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No hay oportunidades registradas para esta empresa.</p>
        <button class="btn btn-sm btn-primary mt-2" onclick="openAddOppModalForCurrentCompany()">+ Nueva Oportunidad</button>
      </div>
    `;
    return;
  }

  comp.opportunities.forEach(opp => {
    const oppCard = createOpportunityCardElement({ ...opp, companyName: comp.name, companyId: comp.id });
    container.appendChild(oppCard);
  });
}

// Subpestaña 3: Bitácora de Seguimiento & Voz
function renderCompanyFollowups(comp) {
  const container = document.getElementById('company-followups-list');
  container.innerHTML = '';

  if (!comp.followups || comp.followups.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No se han registrado notas ni seguimientos con voz.</p>
        <button class="btn btn-sm btn-voice mt-2" onclick="openVoiceFollowupModal()">🎙️ Grabar Nota de Voz</button>
      </div>
    `;
    return;
  }

  // Ordenar cronológicamente (más recientes primero)
  const sorted = [...comp.followups].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(fol => {
    container.appendChild(createFollowupItemElement(fol));
  });
}

function createFollowupItemElement(fol) {
  const item = document.createElement('div');
  item.className = `followup-item ${fol.audioData ? 'has-audio' : ''}`;

  const companyLabel = fol.companyName ? `🏢 ${escapeHTML(fol.companyName)}` : '';
  const contactLabel = fol.contactName ? ` • 👤 ${escapeHTML(fol.contactName)}` : '';

  item.innerHTML = `
    <div class="followup-header">
      <div>
        <span class="followup-channel-badge">${escapeHTML(fol.channel || 'Acción')}</span>
        ${companyLabel ? `<span style="font-size:0.75rem; font-weight:700; color:var(--primary); margin-left:6px;">${companyLabel}${contactLabel}</span>` : ''}
      </div>
      <span class="followup-date">${formatDateTime(fol.date)}</span>
    </div>

    ${fol.audioData ? `
      <audio controls src="${fol.audioData}" class="followup-audio-player"></audio>
    ` : ''}

    ${fol.transcript ? `
      <div class="followup-transcript-box">
        <strong>📝 Transcripción / Detalle:</strong>
        <p style="margin-top:2px;">${escapeHTML(fol.transcript)}</p>
      </div>
    ` : ''}

    ${fol.summary ? `
      <div class="followup-summary-box">
        <strong>✨ Resumen Ejecutivo:</strong>
        <p style="white-space: pre-line; margin-top:2px;">${escapeHTML(fol.summary)}</p>
      </div>
    ` : ''}

    ${fol.nextAction ? `
      <div class="followup-next-row">
        <span>🎯 Próximo Compromiso: ${escapeHTML(fol.nextAction)}</span>
        ${fol.nextDate ? `<span>(${formatDate(fol.nextDate)})</span>` : ''}
      </div>
    ` : ''}
  `;
  return item;
}

// ==========================================
// 5. GESTIÓN DE EMPRESAS (CREAR / EDITAR / ELIMINAR)
// ==========================================
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    currentLogoBase64 = e.target.result;
    const imgEl = document.getElementById('company-logo-img');
    const placeEl = document.getElementById('company-logo-placeholder');
    const rmBtn = document.getElementById('btn-remove-logo');

    imgEl.src = currentLogoBase64;
    imgEl.classList.remove('hidden');
    placeEl.classList.add('hidden');
    rmBtn.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function removeCompanyLogo() {
  currentLogoBase64 = null;
  const imgEl = document.getElementById('company-logo-img');
  const placeEl = document.getElementById('company-logo-placeholder');
  const rmBtn = document.getElementById('btn-remove-logo');

  imgEl.src = '';
  imgEl.classList.add('hidden');
  placeEl.classList.remove('hidden');
  rmBtn.classList.add('hidden');
  document.getElementById('company-logo-input').value = '';
}

function handleSaveCompany(event) {
  event.preventDefault();
  const id = document.getElementById('company-id').value;
  const name = document.getElementById('company-name').value.trim();
  const segment = document.getElementById('company-segment').value;
  const geography = document.getElementById('company-geography').value;
  const website = document.getElementById('company-website').value.trim();
  const description = document.getElementById('company-description').value.trim();

  if (!name) {
    alert('El nombre de la empresa es obligatorio.');
    return;
  }

  if (id) {
    // Editar existente
    const comp = companies.find(c => c.id === id);
    if (comp) {
      comp.name = name;
      comp.segment = segment;
      comp.geography = geography;
      comp.website = website;
      comp.description = description;
      if (currentLogoBase64 !== undefined) comp.logo = currentLogoBase64;
      showToast('Empresa actualizada con éxito');
    }
  } else {
    // Crear nueva
    const newComp = {
      id: 'comp-' + Date.now(),
      name,
      segment,
      geography,
      website,
      description,
      logo: currentLogoBase64,
      createdAt: new Date().toISOString(),
      contacts: [],
      opportunities: [],
      followups: []
    };
    companies.unshift(newComp);
    showToast('Nueva empresa registrada');
  }

  saveCompanies();
  closeModal('modal-add-company');
  renderAllViews();
}

function editCurrentCompany() {
  const comp = companies.find(c => c.id === selectedCompanyId);
  if (!comp) return;

  closeModal('modal-company-details');

  document.getElementById('company-id').value = comp.id;
  document.getElementById('company-name').value = comp.name;
  document.getElementById('company-segment').value = comp.segment;
  document.getElementById('company-geography').value = comp.geography;
  document.getElementById('company-website').value = comp.website || '';
  document.getElementById('company-description').value = comp.description || '';

  currentLogoBase64 = comp.logo || null;
  const imgEl = document.getElementById('company-logo-img');
  const placeEl = document.getElementById('company-logo-placeholder');
  const rmBtn = document.getElementById('btn-remove-logo');

  if (currentLogoBase64) {
    imgEl.src = currentLogoBase64;
    imgEl.classList.remove('hidden');
    placeEl.classList.add('hidden');
    rmBtn.classList.remove('hidden');
  } else {
    removeCompanyLogo();
  }

  document.getElementById('company-modal-title').textContent = 'Editar Empresa';
  document.getElementById('btn-save-company').textContent = 'Actualizar Empresa';

  openModal('modal-add-company');
}

function deleteCurrentCompany() {
  if (!confirm('¿Estás seguro de que deseas eliminar esta empresa, todos sus contactos y oportunidades?')) return;
  companies = companies.filter(c => c.id !== selectedCompanyId);
  saveCompanies();
  closeModal('modal-company-details');
  showToast('Empresa eliminada');
  renderAllViews();
}

// ==========================================
// 6. GESTIÓN DE CONTACTOS DE LA EMPRESA
// ==========================================
function openAddContactModal(preselectedCompanyId = null) {
  if (companies.length === 0) {
    alert('Primero debes registrar al menos una Empresa para poder asociarle un contacto.');
    openModal('modal-add-company');
    return;
  }

  populateContactCompanySelect();
  document.getElementById('form-contact').reset();
  document.getElementById('contact-id').value = '';

  const targetCompId = preselectedCompanyId || selectedCompanyId || (companies[0] ? companies[0].id : '');
  if (targetCompId) {
    document.getElementById('contact-company-select').value = targetCompId;
  }

  openModal('modal-add-contact');
}

function populateContactCompanySelect() {
  const select = document.getElementById('contact-company-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- Seleccionar Empresa --</option>';
  companies.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.segment} - ${c.geography})`;
    select.appendChild(opt);
  });
}

function handleSaveContact(event) {
  event.preventDefault();
  const companyId = document.getElementById('contact-company-select').value;
  const name = document.getElementById('contact-name').value.trim();
  const role = document.getElementById('contact-role').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const comments = document.getElementById('contact-comments').value.trim();

  if (!companyId || !name) {
    alert('Por favor selecciona una empresa e ingresa el nombre del contacto.');
    return;
  }

  const comp = companies.find(c => c.id === companyId);
  if (!comp) return;

  if (!comp.contacts) comp.contacts = [];

  const newContact = {
    id: 'con-' + Date.now(),
    name,
    role,
    phone,
    email,
    comments
  };

  comp.contacts.push(newContact);
  saveCompanies();
  closeModal('modal-add-contact');
  showToast('Contacto agregado exitosamente');

  if (selectedCompanyId === companyId) {
    openCompanyDetails(companyId);
    switchCompanySubtab('contacts');
  }
  renderAllViews();
}

function deleteContact(contactId) {
  if (!confirm('¿Eliminar este contacto?')) return;
  const comp = companies.find(c => c.id === selectedCompanyId);
  if (comp && comp.contacts) {
    comp.contacts = comp.contacts.filter(ct => ct.id !== contactId);
    saveCompanies();
    showToast('Contacto eliminado');
    openCompanyDetails(comp.id);
    renderAllViews();
  }
}

// ==========================================
// 7. GESTIÓN DE OPORTUNIDADES
// ==========================================
function populateOpportunityCompanySelect() {
  const select = document.getElementById('opp-company-id');
  if (!select) return;
  select.innerHTML = '<option value="">-- Seleccionar Empresa --</option>';
  companies.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.segment} - ${c.geography})`;
    select.appendChild(opt);
  });
}

function openAddOppModal(preselectedCompId = null) {
  if (companies.length === 0) {
    alert('Primero debes registrar al menos una Empresa para poder asociarle una oportunidad.');
    openModal('modal-add-company');
    return;
  }

  populateOpportunityCompanySelect();
  document.getElementById('form-opportunity').reset();
  document.getElementById('opp-id').value = '';
  
  const targetCompId = preselectedCompId || selectedCompanyId || (companies[0] ? companies[0].id : '');
  if (targetCompId) {
    document.getElementById('opp-company-id').value = targetCompId;
  }
  document.getElementById('opp-deadline').value = getDateOffsetString(30);

  openModal('modal-add-opportunity');
}

function openAddOppModalForCurrentCompany() {
  openAddOppModal(selectedCompanyId);
}

function handleSaveOpportunity(event) {
  event.preventDefault();
  const companyId = document.getElementById('opp-company-id').value;
  const name = document.getElementById('opp-name').value.trim();
  const type = document.getElementById('opp-type').value;
  const scope = document.getElementById('opp-scope').value;
  const amount = parseFloat(document.getElementById('opp-amount').value) || 0;
  const deadline = document.getElementById('opp-deadline').value;
  const description = document.getElementById('opp-description').value.trim();

  const comp = companies.find(c => c.id === companyId);
  if (!comp) {
    alert('Por favor selecciona una empresa.');
    return;
  }

  if (!comp.opportunities) comp.opportunities = [];

  const newOpp = {
    id: 'opp-' + Date.now(),
    name,
    type,
    scope,
    amount,
    deadline,
    description,
    createdAt: new Date().toISOString()
  };

  comp.opportunities.push(newOpp);
  saveCompanies();
  closeModal('modal-add-opportunity');
  showToast('Oportunidad guardada');

  if (selectedCompanyId === companyId) {
    openCompanyDetails(companyId);
    switchCompanySubtab('opps');
  }
  renderAllViews();
}

// ==========================================
// 8. NOTAS DE VOZ, TRANSCRIPCIÓN Y RESUMEN INTELIGENTE
// ==========================================
function initSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    speechRecognition = new SpeechRec();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'es-ES'; // Reconocimiento en español

    speechRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      const transInput = document.getElementById('followup-transcript');
      if (transInput) {
        transInput.value = finalTranscript;
        // Generar resumen automático preliminar si hay suficiente texto
        if (finalTranscript.length > 35) {
          generateExecutiveSummaryFromText(finalTranscript);
        }
      }
    };

    speechRecognition.onerror = (event) => {
      console.warn('SpeechRecognition error:', event.error);
    };

    isSpeechSupported = true;
  } else {
    isSpeechSupported = false;
  }
}

function openGlobalAddActionModal(preselectedCompId = null, preselectedContactId = null) {
  if (companies.length === 0) {
    alert('Primero debes registrar al menos una Empresa para poder asociarle una acción comercial.');
    openModal('modal-add-company');
    return;
  }

  document.getElementById('form-followup').reset();
  document.getElementById('followup-id').value = '';

  const targetCompId = preselectedCompId || selectedCompanyId || companies[0].id;
  populateFollowupCompanySelect(targetCompId, preselectedContactId);

  // Fecha y hora local actual
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('followup-date').value = now.toISOString().slice(0, 16);
  document.getElementById('followup-next-date').value = getDateOffsetString(3);

  resetVoiceRecorderUI();
  setFollowupMode('voice');
  openModal('modal-add-followup');
}

function openVoiceFollowupModal() {
  openGlobalAddActionModal(selectedCompanyId);
}

function populateFollowupCompanySelect(selectedCompId = null, preselectedContactId = null) {
  const compSelect = document.getElementById('followup-company-select');
  if (!compSelect) return;

  compSelect.innerHTML = '';
  companies.forEach(comp => {
    const opt = document.createElement('option');
    opt.value = comp.id;
    opt.textContent = `${comp.name} (${comp.segment} - ${comp.geography})`;
    if (selectedCompId && comp.id === selectedCompId) {
      opt.selected = true;
    }
    compSelect.appendChild(opt);
  });

  const activeCompId = compSelect.value || (companies[0] ? companies[0].id : null);
  handleFollowupCompanyChange(activeCompId, preselectedContactId);
}

function handleFollowupCompanyChange(companyId, preselectedContactId = null) {
  const contactSelect = document.getElementById('followup-contact-select');
  if (!contactSelect) return;

  contactSelect.innerHTML = '<option value="">-- Sin contacto específico / General --</option>';

  const comp = companies.find(c => c.id === companyId);
  if (comp && comp.contacts && comp.contacts.length > 0) {
    comp.contacts.forEach(contact => {
      const opt = document.createElement('option');
      opt.value = contact.id;
      opt.textContent = `${contact.name} (${contact.role || 'Contacto'})`;
      if (preselectedContactId && contact.id === preselectedContactId) {
        opt.selected = true;
      }
      contactSelect.appendChild(opt);
    });
  }
}

function setFollowupMode(mode) {
  const voiceTab = document.getElementById('tab-mode-voice');
  const textTab = document.getElementById('tab-mode-text');
  const recorderBox = document.getElementById('voice-recorder-module');

  if (mode === 'voice') {
    voiceTab.classList.add('active');
    textTab.classList.remove('active');
    recorderBox.style.display = 'block';
  } else {
    voiceTab.classList.remove('active');
    textTab.classList.add('active');
    recorderBox.style.display = 'none';
  }
}

function resetVoiceRecorderUI() {
  stopVoiceRecording();
  audioChunks = [];
  recordedAudioBase64 = null;
  recordingSeconds = 0;
  isRecording = false;

  document.getElementById('rec-timer').textContent = '00:00';
  document.getElementById('rec-indicator').classList.remove('recording');
  document.getElementById('rec-label').textContent = 'Presiona el micrófono para comenzar a hablar';
  document.getElementById('btn-toggle-record').classList.remove('recording');
  document.getElementById('audio-playback-container').classList.add('hidden');
}

async function toggleVoiceRecording() {
  if (isRecording) {
    stopVoiceRecording();
  } else {
    await startVoiceRecording();
  }
}

async function startVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm; codecs=opus' });
      const reader = new FileReader();
      reader.onload = (e) => {
        recordedAudioBase64 = e.target.result;
        const player = document.getElementById('followup-audio-player');
        player.src = recordedAudioBase64;
        document.getElementById('audio-playback-container').classList.remove('hidden');
      };
      reader.readAsDataURL(audioBlob);

      // Detener pistas de audio
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    isRecording = true;

    // Iniciar reconocimiento de voz
    if (speechRecognition) {
      try {
        speechRecognition.start();
      } catch (err) {
        // Podría estar ya iniciado
      }
    }

    // Temporizador
    recordingSeconds = 0;
    document.getElementById('rec-indicator').classList.add('recording');
    document.getElementById('btn-toggle-record').classList.add('recording');
    document.getElementById('rec-label').textContent = 'Grabando y transcribiendo en vivo... (Toca para finalizar)';

    recordingTimerInterval = setInterval(() => {
      recordingSeconds++;
      const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
      const secs = String(recordingSeconds % 60).padStart(2, '0');
      document.getElementById('rec-timer').textContent = `${mins}:${secs}`;
    }, 1000);

  } catch (err) {
    console.error('Error al acceder al micrófono:', err);
    alert('No se pudo acceder al micrófono. Verifica los permisos de tu navegador o escribe la nota directamente.');
  }
}

function stopVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (speechRecognition) {
    try {
      speechRecognition.stop();
    } catch (e) {}
  }
  if (recordingTimerInterval) {
    clearInterval(recordingTimerInterval);
    recordingTimerInterval = null;
  }
  isRecording = false;

  document.getElementById('rec-indicator').classList.remove('recording');
  document.getElementById('btn-toggle-record').classList.remove('recording');
  document.getElementById('rec-label').textContent = 'Grabación finalizada.';

  // Generar resumen ejecutivo final con el texto obtenido
  const currentText = document.getElementById('followup-transcript').value;
  if (currentText.trim()) {
    generateExecutiveSummaryFromText(currentText);
  }
}

/**
 * Generador Inteligente de Resumen Ejecutivo de la Nota de Voz
 * Sintetiza puntos clave, compromisos detectados y próximo paso
 */
function generateExecutiveSummaryFromText(text) {
  if (!text || text.trim().length === 0) return;

  const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
  
  // Detección de compromisos / fechas / precios
  let points = [];
  let agreements = [];
  let nextSteps = [];

  sentences.forEach(s => {
    const lower = s.toLowerCase();
    if (lower.includes('acord') || lower.includes('quedamos') || lower.includes('compromis') || lower.includes('pidió') || lower.includes('solicitó') || lower.includes('enviar')) {
      agreements.push(s.trim());
    } else if (lower.includes('próximo') || lower.includes('siguiente') || lower.includes('reunión') || lower.includes('viernes') || lower.includes('lunes') || lower.includes('semana')) {
      nextSteps.push(s.trim());
    } else {
      points.push(s.trim());
    }
  });

  let summaryLines = [];
  summaryLines.push('📌 Puntos Clave: ' + (points.length > 0 ? points.slice(0, 2).join(' ') : text.slice(0, 120) + '...'));
  
  if (agreements.length > 0) {
    summaryLines.push('🤝 Acuerdos: ' + agreements.join(' '));
  } else {
    summaryLines.push('🤝 Acuerdos: Se dio seguimiento al avance comercial.');
  }

  if (nextSteps.length > 0) {
    summaryLines.push('🎯 Próximo Paso: ' + nextSteps[0]);
  } else {
    summaryLines.push('🎯 Próximo Paso: Continuar seguimiento según cronograma.');
  }

  const summaryArea = document.getElementById('followup-summary');
  if (summaryArea && (!summaryArea.value || summaryArea.value.startsWith('📌'))) {
    summaryArea.value = summaryLines.join('\n');
  }
}

function regenerateSummary() {
  const text = document.getElementById('followup-transcript').value;
  if (!text) {
    alert('Primero escribe o dicta una nota para poder generar el resumen.');
    return;
  }
  generateExecutiveSummaryFromText(text);
  showToast('Resumen ejecutivo generado');
}

function handleSaveFollowup(event) {
  event.preventDefault();
  const companyId = document.getElementById('followup-company-select').value;
  const contactId = document.getElementById('followup-contact-select').value;
  const date = document.getElementById('followup-date').value || new Date().toISOString();
  const channel = document.getElementById('followup-channel').value;
  const transcript = document.getElementById('followup-transcript').value.trim();
  const summary = document.getElementById('followup-summary').value.trim();
  const nextAction = document.getElementById('followup-next-action').value.trim();
  const nextDate = document.getElementById('followup-next-date').value;

  if (!companyId || !transcript) {
    alert('Por favor selecciona una empresa y agrega la nota o transcripción de la acción comercial.');
    return;
  }

  const comp = companies.find(c => c.id === companyId);
  if (!comp) {
    alert('Empresa no encontrada.');
    return;
  }

  if (!comp.followups) comp.followups = [];

  let contactName = '';
  let contactRole = '';
  if (contactId && comp.contacts) {
    const ct = comp.contacts.find(c => c.id === contactId);
    if (ct) {
      contactName = ct.name;
      contactRole = ct.role;
    }
  }

  const newFollowup = {
    id: 'fol-' + Date.now(),
    companyId: comp.id,
    companyName: comp.name,
    contactId: contactId || null,
    contactName: contactName,
    contactRole: contactRole,
    date,
    channel,
    audioData: recordedAudioBase64,
    transcript,
    summary,
    nextAction,
    nextDate,
    createdAt: new Date().toISOString()
  };

  comp.followups.unshift(newFollowup);
  saveCompanies();

  closeModal('modal-add-followup');
  showToast('Acción comercial registrada con éxito');

  // Si estamos en la ficha de esta empresa, refrescar la pestaña de seguimiento
  if (selectedCompanyId === companyId) {
    openCompanyDetails(companyId);
    switchCompanySubtab('followup');
  }
  renderAllViews();
}

// ==========================================
// 9. EXPORTACIÓN & IMPORTACIÓN DE DATOS
// ==========================================
function exportDataJSON() {
  const backup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    companies
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `crm_empresas_respaldo_${getTodayDateString()}.json`);
  link.click();
  showToast('Respaldo JSON descargado');
}

function exportToCSV() {
  if (companies.length === 0) {
    alert('No hay empresas registradas para exportar.');
    return;
  }

  let csvContent = '\uFEFF'; // BOM para soporte de caracteres en español en Excel
  csvContent += 'Empresa,Segmento,Geografia,Sitio Web,Total Oportunidades USD,Cant Contactos,Cant Oportunidades,Descripcion\r\n';

  companies.forEach(c => {
    const oppsTotal = (c.opportunities || []).reduce((s, o) => s + (Number(o.amount) || 0), 0);
    const row = [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.segment || '').replace(/"/g, '""')}"`,
      `"${(c.geography || '').replace(/"/g, '""')}"`,
      `"${(c.website || '').replace(/"/g, '""')}"`,
      oppsTotal,
      c.contacts ? c.contacts.length : 0,
      c.opportunities ? c.opportunities.length : 0,
      `"${(c.description || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `cartera_empresas_epc_${getTodayDateString()}.csv`);
  link.click();
  showToast('Reporte Excel CSV generado');
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.companies)) {
        companies = data.companies;
        saveCompanies();
        showToast('Respaldo restaurado exitosamente');
        renderAllViews();
      } else {
        alert('Formato de archivo no válido.');
      }
    } catch (err) {
      alert('Error al leer el archivo de respaldo.');
    }
  };
  reader.readAsText(file);
}

function resetToSampleData() {
  if (!confirm('¿Deseas restaurar las empresas industriales de prueba (Techint, Iberdrola, YPF, Vale)?')) return;
  companies = [...INITIAL_COMPANIES];
  saveCompanies();
  showToast('Datos de prueba cargados');
  renderAllViews();
}

// Botón de respaldo rápido en la barra superior
document.getElementById('btn-quick-backup')?.addEventListener('click', () => {
  exportDataJSON();
});

// ==========================================
// 10. MODALES Y TOASTS
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modalId === 'modal-add-company' && !document.getElementById('company-id').value) {
    document.getElementById('form-company').reset();
    document.getElementById('company-id').value = '';
    removeCompanyLogo();
    document.getElementById('company-modal-title').textContent = 'Nueva Empresa Cliente';
    document.getElementById('btn-save-company').textContent = 'Guardar Empresa';
  }

  if (modalId === 'modal-add-opportunity') {
    populateOpportunityCompanySelect();
  }

  if (modalId === 'modal-add-contact') {
    populateContactCompanySelect();
  }

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 250);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
