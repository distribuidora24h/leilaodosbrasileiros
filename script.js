/* ==========================================================================
   Leilão dos Brasileiros — lógica do catálogo
   JavaScript puro, sem dependências. Funciona em hospedagem estática.
   ========================================================================== */
'use strict';

/* --------------------------------------------------------------------------
   1. CONFIGURAÇÃO
   -------------------------------------------------------------------------- */

/**
 * NÚMERO DE WHATSAPP
 * Substitua pelo número real em formato internacional, somente dígitos.
 * Exemplo (Brasil, DDD 13): '5513999999999'  → 55 + DDD + número.
 * Sem espaços, parênteses, traços ou o sinal de "+".
 * Enquanto estiver vazio, o site avisa que o contato precisa ser configurado
 * e não direciona ninguém para nenhum número.
 */
const WHATSAPP_NUMBER = '';

const SITE_CONFIG = {
  brandName: 'Leilão dos Brasileiros',
  /**
   * Modo demonstração: exibe o aviso no topo e a etiqueta "Exemplo" nos lotes
   * marcados com sample: true. Antes de publicar, troque por false
   * e substitua os lotes de exemplo por dados reais.
   */
  demoMode: true,
};

/* --------------------------------------------------------------------------
   2. DADOS
   -------------------------------------------------------------------------- */

const CATEGORIES = [
  { id: 'imoveis', label: 'Imóveis' },
  { id: 'veiculos', label: 'Veículos' },
  { id: 'motos', label: 'Motos' },
  { id: 'outros', label: 'Outros Bens' },
];

const STATUSES = [
  { id: 'aberto', label: 'Aberto para consulta' },
  { id: 'em-breve', label: 'Em breve' },
  { id: 'encerrado', label: 'Encerrado' },
];

/**
 * LOTES — DADOS DE EXEMPLO (substituir antes da publicação)
 * Todos os lotes abaixo são fictícios e servem só como demonstração visual.
 * Não representam bens, valores, locais ou situações reais.
 *
 * Como atualizar cada campo:
 *  - id:          identificador único e estável (texto sem espaços).
 *  - lot:         número do lote exibido no card.
 *  - category:    'imoveis' | 'veiculos' | 'motos' | 'outros'.
 *  - status:      'aberto' | 'em-breve' | 'encerrado'.
 *  - price:       valor inicial em reais (número, ex.: 150000). Use null quando
 *                 não houver valor a informar; o card mostrará "Consultar valor".
 *  - priceLabel:  rótulo do valor (ex.: 'Valor inicial', 'Valor de referência').
 *  - image:       caminho da foto. Para trocar por foto real, coloque o arquivo
 *                 na pasta images/ e informe 'images/nome-do-arquivo.jpg'.
 *                 Deixe '' se ainda não houver foto (aparece um espaço reservado).
 *  - imageAlt:    descrição curta da foto, para leitores de tela.
 *  - sample:      true enquanto o lote for de exemplo; remova ou use false
 *                 quando for um lote real.
 */
const LOTS = [
  {
    id: 'ex-001',
    lot: 'Lote 001',
    category: 'imoveis',
    title: 'Apartamento em edifício residencial',
    location: 'Recife, PE',
    status: 'aberto',
    price: 420000,
    priceLabel: 'Valor inicial',
    image: 'images/imovel-apartamento.jpg',
    imageAlt: 'Fachada de edifício residencial com revestimento azul em rua urbana',
    description:
      'Apartamento em edifício residencial. Descrição de exemplo: substitua pela metragem, número de quartos, vagas e situação do imóvel.',
    sample: true,
  },
  {
    id: 'ex-002',
    lot: 'Lote 002',
    category: 'imoveis',
    title: 'Galpão comercial com área administrativa',
    location: 'Campinas, SP',
    status: 'em-breve',
    price: null,
    priceLabel: 'Valor inicial',
    image: 'images/imovel-galpao.jpg',
    imageAlt: 'Galpão com fachada cinza, entrada envidraçada e portão de carga',
    description:
      'Galpão com entrada social e portão de carga. Descrição de exemplo: substitua pela área construída, área do terreno e condições de acesso.',
    sample: true,
  },
  {
    id: 'ex-003',
    lot: 'Lote 003',
    category: 'veiculos',
    title: 'Conjunto de veículos diversos',
    location: 'São Paulo, SP',
    status: 'aberto',
    price: 18500,
    priceLabel: 'Valor inicial',
    image: 'images/veiculos-patio.jpg',
    imageAlt: 'Pátio com grande quantidade de automóveis estacionados em fileiras',
    description:
      'Veículos reunidos em pátio. Descrição de exemplo: substitua por marca, modelo, ano, quilometragem e condição de documentação de cada veículo.',
    sample: true,
  },
  {
    id: 'ex-004',
    lot: 'Lote 004',
    category: 'motos',
    title: 'Motocicleta 160 cc',
    location: 'Santos, SP',
    status: 'em-breve',
    price: 7200,
    priceLabel: 'Valor inicial',
    image: '',
    imageAlt: 'Motocicleta (foto a ser adicionada)',
    description:
      'Lote de moto de exemplo, ainda sem foto. Descrição de exemplo: substitua por marca, modelo, ano e condição.',
    sample: true,
  },
  {
    id: 'ex-005',
    lot: 'Lote 005',
    category: 'outros',
    title: 'Máquinas e equipamentos industriais',
    location: 'Curitiba, PR',
    status: 'aberto',
    price: null,
    priceLabel: 'Valor de referência',
    image: 'images/bens-maquinas.jpg',
    imageAlt: 'Galpão industrial com tornos e máquinas de usinagem expostos',
    description:
      'Conjunto de máquinas em galpão. Descrição de exemplo: substitua pela relação de equipamentos, estado de conservação e local de retirada.',
    sample: true,
  },
  {
    id: 'ex-006',
    lot: 'Lote 006',
    category: 'imoveis',
    title: 'Apartamento de três quartos',
    location: 'Curitiba, PR',
    status: 'encerrado',
    price: 315000,
    priceLabel: 'Valor inicial',
    image: 'images/imovel-apartamento.jpg',
    imageAlt: 'Edifício residencial de vários andares visto da rua',
    description:
      'Lote de exemplo já encerrado, usado para demonstrar o status. Substitua ou remova antes de publicar.',
    sample: true,
  },
];

/* --------------------------------------------------------------------------
   3. UTILITÁRIOS
   -------------------------------------------------------------------------- */

const ALL = 'todos';

const currencyFormat = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** Minúsculas e sem acentos, para pesquisa tolerante. */
function normalize(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function categoryLabel(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : id;
}

function statusLabel(id) {
  const found = STATUSES.find((s) => s.id === id);
  return found ? found.label : id;
}

/** Cria um elemento com atributos e filhos, sem usar innerHTML. */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  });
  [].concat(children).forEach((child) => {
    if (child) node.append(child);
  });
  return node;
}

/* --------------------------------------------------------------------------
   4. WHATSAPP
   -------------------------------------------------------------------------- */

function isWhatsappConfigured() {
  return /^\d{10,15}$/.test(WHATSAPP_NUMBER);
}

/** Monta a mensagem pré-preenchida, com identificação do lote quando houver. */
function buildMessage(lot) {
  if (!lot) {
    return `Olá! Vim pelo site ${SITE_CONFIG.brandName} e gostaria de mais informações.`;
  }
  return (
    `Olá! Tenho interesse no ${lot.lot}: ${lot.title}` +
    ` (${categoryLabel(lot.category)}, ${lot.location}).` +
    ' Gostaria de mais informações.'
  );
}

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 6000);
}

function contactWhatsapp(lot) {
  if (!isWhatsappConfigured()) {
    showToast('O contato por WhatsApp ainda precisa ser configurado neste site.');
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(lot))}`;
  window.open(url, '_blank', 'noopener');
}

/* --------------------------------------------------------------------------
   5. IMAGENS COM FALHA SEGURA
   -------------------------------------------------------------------------- */

function mediaFallback(text) {
  return el('div', { class: 'media-fallback', role: 'img', 'aria-label': text, text });
}

/** Retorna uma <img> que troca por um espaço reservado se a imagem falhar. */
function lotImage(lot, loading) {
  if (!lot.image) return mediaFallback('Foto a ser adicionada');
  const img = el('img', {
    src: lot.image,
    alt: lot.imageAlt || lot.title,
    loading,
    decoding: 'async',
  });
  img.addEventListener('error', () => {
    img.replaceWith(mediaFallback('Imagem indisponível'));
  });
  return img;
}

/* --------------------------------------------------------------------------
   6. RENDERIZAÇÃO
   -------------------------------------------------------------------------- */

const state = { query: '', category: ALL, status: ALL, location: ALL };

const refs = {};

function priceBlock(lot) {
  const hasPrice = typeof lot.price === 'number';
  return el('div', { class: 'lot-price' }, [
    el('span', { class: 'price-label', text: lot.priceLabel || 'Valor informado' }),
    el('span', {
      class: hasPrice ? 'price-value' : 'price-value is-consult',
      text: hasPrice ? currencyFormat.format(lot.price) : 'Consultar valor',
    }),
  ]);
}

function statusBadge(lot) {
  return el('span', { class: `status status-${lot.status}`, text: statusLabel(lot.status) });
}

function createCard(lot, index) {
  const media = el('div', { class: 'lot-media' }, [lotImage(lot, index < 3 ? 'eager' : 'lazy')]);
  if (SITE_CONFIG.demoMode && lot.sample) {
    media.append(el('span', { class: 'sample-tag', text: 'Exemplo' }));
  }

  const detailsBtn = el('button', { type: 'button', class: 'btn btn-outline', text: 'Detalhes' });
  detailsBtn.setAttribute('aria-label', `Ver detalhes do ${lot.lot}: ${lot.title}`);
  detailsBtn.addEventListener('click', () => openDialog(lot));

  const contactBtn = el('button', { type: 'button', class: 'btn btn-whatsapp', text: 'WhatsApp' });
  contactBtn.setAttribute('aria-label', `Consultar o ${lot.lot} pelo WhatsApp`);
  contactBtn.addEventListener('click', () => contactWhatsapp(lot));

  const body = el('div', { class: 'lot-body' }, [
    el('div', { class: 'lot-meta' }, [
      el('span', { text: `${categoryLabel(lot.category)} · ${lot.lot}` }),
      statusBadge(lot),
    ]),
    el('h3', { class: 'lot-title', text: lot.title }),
    el('p', { class: 'lot-location', text: lot.location }),
    priceBlock(lot),
    el('div', { class: 'lot-actions' }, [detailsBtn, contactBtn]),
  ]);

  return el('article', { class: 'lot-card' }, [media, body]);
}

function matchesQuery(lot, query) {
  if (!query) return true;
  const haystack = normalize(
    [lot.title, lot.description, lot.location, lot.lot, categoryLabel(lot.category)].join(' ')
  );
  // Todas as palavras digitadas precisam aparecer em algum campo.
  return normalize(query)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

function getFilteredLots() {
  return LOTS.filter(
    (lot) =>
      matchesQuery(lot, state.query) &&
      (state.category === ALL || lot.category === state.category) &&
      (state.status === ALL || lot.status === state.status) &&
      (state.location === ALL || lot.location === state.location)
  );
}

function render() {
  const lots = getFilteredLots();
  refs.grid.replaceChildren(...lots.map(createCard));
  refs.empty.hidden = lots.length > 0;
  refs.count.textContent =
    lots.length === 1 ? '1 lote encontrado' : `${lots.length} lotes encontrados`;
}

/* --------------------------------------------------------------------------
   7. FILTROS
   -------------------------------------------------------------------------- */

function fillSelect(select, allLabel, options) {
  select.replaceChildren(
    el('option', { value: ALL, text: allLabel }),
    ...options.map((o) => el('option', { value: o.id, text: o.label }))
  );
}

function setupFilters() {
  fillSelect(refs.category, 'Todas as categorias', CATEGORIES);
  fillSelect(refs.status, 'Todas as situações', STATUSES);

  const locations = [...new Set(LOTS.map((l) => l.location))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
  fillSelect(
    refs.location,
    'Todas as localizações',
    locations.map((l) => ({ id: l, label: l }))
  );

  refs.search.addEventListener('input', () => {
    state.query = refs.search.value;
    render();
  });
  refs.searchForm.addEventListener('submit', (event) => event.preventDefault());

  refs.category.addEventListener('change', () => {
    state.category = refs.category.value;
    render();
  });
  refs.status.addEventListener('change', () => {
    state.status = refs.status.value;
    render();
  });
  refs.location.addEventListener('change', () => {
    state.location = refs.location.value;
    render();
  });

  refs.clear.addEventListener('click', clearFilters);
  refs.emptyClear.addEventListener('click', clearFilters);
}

function clearFilters() {
  state.query = '';
  state.category = ALL;
  state.status = ALL;
  state.location = ALL;
  refs.search.value = '';
  refs.category.value = ALL;
  refs.status.value = ALL;
  refs.location.value = ALL;
  render();
}

/* --------------------------------------------------------------------------
   8. PAINEL DE DETALHES
   -------------------------------------------------------------------------- */

let currentLot = null;

function openDialog(lot) {
  currentLot = lot;
  const d = refs.dialog;

  d.media.replaceChildren(lotImage(lot, 'eager'));
  d.meta.textContent = `${categoryLabel(lot.category)} · ${lot.lot}`;
  d.title.textContent = lot.title;
  d.location.textContent = lot.location;
  d.status.replaceChildren(statusBadge(lot));
  d.priceLabel.textContent = lot.priceLabel || 'Valor informado';
  d.price.textContent =
    typeof lot.price === 'number' ? currencyFormat.format(lot.price) : 'Consultar valor';
  d.description.textContent = lot.description;
  d.demo.hidden = !(SITE_CONFIG.demoMode && lot.sample);

  if (typeof refs.dialog.root.showModal === 'function') {
    refs.dialog.root.showModal();
  } else {
    refs.dialog.root.setAttribute('open', '');
  }
}

function closeDialog() {
  if (typeof refs.dialog.root.close === 'function') {
    refs.dialog.root.close();
  } else {
    refs.dialog.root.removeAttribute('open');
  }
  currentLot = null;
}

function setupDialog() {
  const root = refs.dialog.root;

  refs.dialog.close.addEventListener('click', closeDialog);
  refs.dialog.contact.addEventListener('click', () => {
    if (currentLot) contactWhatsapp(currentLot);
  });

  // Clique no fundo escurecido (fora do painel) fecha o modal.
  root.addEventListener('click', (event) => {
    if (event.target === root) closeDialog();
  });
}

/* --------------------------------------------------------------------------
   9. MENU MOBILE
   -------------------------------------------------------------------------- */

function setupMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/* --------------------------------------------------------------------------
   10. INICIALIZAÇÃO
   -------------------------------------------------------------------------- */

function init() {
  refs.grid = document.getElementById('lot-grid');
  refs.empty = document.getElementById('empty-state');
  refs.count = document.getElementById('result-count');
  refs.search = document.getElementById('search-input');
  refs.searchForm = document.getElementById('search-form');
  refs.category = document.getElementById('filter-category');
  refs.status = document.getElementById('filter-status');
  refs.location = document.getElementById('filter-location');
  refs.clear = document.getElementById('clear-filters');
  refs.emptyClear = document.getElementById('empty-clear');
  refs.dialog = {
    root: document.getElementById('lot-dialog'),
    close: document.getElementById('dialog-close'),
    media: document.getElementById('dialog-media'),
    meta: document.getElementById('dialog-meta'),
    title: document.getElementById('dialog-title'),
    location: document.getElementById('dialog-location'),
    status: document.getElementById('dialog-status'),
    priceLabel: document.getElementById('dialog-price-label'),
    price: document.getElementById('dialog-price'),
    description: document.getElementById('dialog-description'),
    demo: document.getElementById('dialog-demo'),
    contact: document.getElementById('dialog-contact'),
  };

  document.getElementById('demo-banner').hidden = !SITE_CONFIG.demoMode;
  document.getElementById('year').textContent = new Date().getFullYear();

  // Botões gerais de contato (cabeçalho e rodapé), sem lote específico.
  document.querySelectorAll('[data-contact="general"]').forEach((btn) => {
    btn.addEventListener('click', () => contactWhatsapp(null));
  });

  setupFilters();
  setupDialog();
  setupMenu();
  render();
}

// O script é carregado com "defer"; o DOM já está disponível aqui.
init();
