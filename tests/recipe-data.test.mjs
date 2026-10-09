import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const serviceWorker = readFileSync(
  new URL('../service-worker.js', import.meta.url),
  'utf8',
);

test('el JavaScript incrustado conserva una sintaxis válida', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    (match) => match[1],
  );
  assert.ok(scripts.length > 0);
  for (const script of scripts) new Function(script);
});

test('las recetas nuevas tienen pestaña, datos y una única fuente principal', () => {
  for (const id of ['tostadastiramisu', 'tiramisuLimon', 'galletasAbuela']) {
    assert.match(html, new RegExp(`data-r="${id}"`));
    assert.match(html, new RegExp(`R\\.${id}=`));
  }

  assert.equal((html.match(/DeQCV1gRyso/g) || []).length, 1);
  assert.equal((html.match(/Dd3TTS1O7au/g) || []).length, 1);
  assert.match(html, /DX4TqQ8RqAn/);
});

test('la tarta de galletas conserva cantidades y límites de la fuente', () => {
  assert.equal((html.match(/DeOqOBANffZ/g) || []).length, 1);
  assert.match(html, /\['leche',750,' ml'/);
  assert.match(html, /\['yemas de huevo',5,''/);
  assert.match(html, /\['maicena',75,' g'/);
  assert.match(html, /\['azúcar o eritritol',125,' g'/);
  assert.match(html, /\['galletas','al gusto'/);
  assert.match(html, /no detalla tiempos, recipiente ni orden completo/);
});

test('el tiramisú de limón no inventa soletillas y exige yemas pasteurizadas', () => {
  assert.match(html, /bizcochos de soletilla','cantidad pendiente'/);
  assert.match(html, /yemas comercialmente pasteurizadas/);
  assert.match(html, /no se considera suficiente calentar yemas crudas solo hasta 66 °C/);
});

test('la cheesecake conserva la procedencia sin atribuir la adaptación', () => {
  assert.equal((html.match(/DePc1XVubD-/g) || []).length, 1);
  assert.equal((html.match(/baileys:\{/g) || []).length, 1);
  assert.equal((html.match(/data-r="baileys"/g) || []).length, 1);
  assert.match(html, /no se atribuyen al autor/);
});

test('la caché offline usa una versión nueva y todos sus activos existen', () => {
  assert.match(serviceWorker, /dulce-a-tu-ritmo-v21/);
  const shellMatch = serviceWorker.match(/const APP_SHELL=\[([^\]]+)\]/);
  assert.ok(shellMatch);
  const assets = [...shellMatch[1].matchAll(/'\.\/(.*?)'/g)].map(
    (match) => match[1] || 'index.html',
  );
  for (const asset of assets) {
    const path = asset === '' ? 'index.html' : asset;
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
  }
});
