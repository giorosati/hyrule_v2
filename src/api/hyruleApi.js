/**
 * Simple client for the Hyrule Compendium API.
 *
 * The upstream documentation is: https://gadhagod.github.io/Hyrule-Compendium-API/#/compendium-api
 * This module provides two helpers:
 *  - fetchList(endpointOrUrl): fetches a list of items from an endpoint or a full URL
 *  - fetchItem(endpointOrUrl, id): fetches a single item by id (if supported)
 *
 * The client is intentionally tolerant of different response shapes. If the response
 * is an object, the client will try to find the first array inside it and return that.
 */

// The canonical API serving compendium data is hosted at botw-compendium.herokuapp.com
// (the documentation site on GitHub Pages is static and will return HTML 404 for API paths).
const DEFAULT_BASE = 'https://botw-compendium.herokuapp.com/api/v3';

function buildUrl(endpointOrUrl) {
  if (!endpointOrUrl) throw new Error('endpointOrUrl is required');
  if (/^https?:\/\//i.test(endpointOrUrl)) return endpointOrUrl;

  // Convenience: allow short names like 'creatures' to map to the compendium category
  const shortCategories = new Set(['creatures', 'equipment', 'materials', 'monsters', 'treasure']);
  const trimmed = endpointOrUrl.replace(/^\//, '').replace(/\/$/, '')

  if (shortCategories.has(trimmed)) {
    return `${DEFAULT_BASE}/compendium/category/${trimmed}`;
  }

  // Allow callers to request 'all' or 'compendium/all'
  if (trimmed === 'all' || trimmed === 'compendium/all') {
    return `${DEFAULT_BASE}/compendium/all`;
  }

  // If caller already passed a compendium path, use it under the base
  if (trimmed.startsWith('compendium/')) {
    return `${DEFAULT_BASE}/${trimmed}`;
  }

  // Fallback: join to the base URL
  return `${DEFAULT_BASE}/${trimmed}`;
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Network error ${res.status} ${res.statusText} — ${text}`);
  }
  return res.json();
}

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    // Try common property names
    for (const key of ['data', 'results', 'entries', 'items']) {
      if (Array.isArray(payload[key])) return payload[key];
    }
    // Otherwise, find the first array value
    const found = Object.values(payload).find(v => Array.isArray(v));
    if (found) return found;
  }
  // As a last resort wrap the payload so callers get at least one item
  return [payload];
}

/**
 * Fetch a list of items from the API.
 * @param {string} endpointOrUrl - endpoint path (e.g. 'creatures') or full URL
 * @returns {Promise<Array>} array of items (may be single-element if API returned an object)
 */
export async function fetchList(endpointOrUrl) {
  const url = buildUrl(endpointOrUrl);
  const json = await fetchJson(url);
  return extractArray(json);
}

/**
 * Fetch a single item. If endpointOrUrl is a full URL, the id will be appended with a '/'.
 * @param {string} endpointOrUrl
 * @param {string|number} id
 * @returns {Promise<object>} item
 */
export async function fetchItem(endpointOrUrl, id) {
  if (id == null) throw new Error('id is required');
  const base = buildUrl(endpointOrUrl);
  const url = `${base.replace(/\/$/, '')}/${encodeURIComponent(String(id))}`;
  const json = await fetchJson(url);
  // If the response is an object wrapper, try to unwrap first value
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    // If it has an 'item'/'data' key return that
    for (const key of ['item', 'data', 'result']) {
      if (json[key]) return json[key];
    }
    return json;
  }
  return json;
}

export default {
  fetchList,
  fetchItem,
};
