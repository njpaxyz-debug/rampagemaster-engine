import assert from 'node:assert/strict';
import { CURRENCY_LADDER, createWallet, convertCurrency, walletSummary } from '../src/modules/economyHighRes.js';

assert.deepEqual(CURRENCY_LADDER.map(({ id, rateToNext }) => [id, rateToNext]), [
  ['bones', 100], ['opal', 25], ['quartz', 10], ['fossils', 5], ['oil', null]
]);
const wallet = createWallet({ bones: 100, opal: 25, quartz: 10, fossils: 5 });
assert.equal(convertCurrency(wallet, 'bones').ok, true); assert.equal(wallet.opal, 26);
assert.equal(convertCurrency(wallet, 'opal').ok, true); assert.equal(wallet.quartz, 11);
assert.equal(convertCurrency(wallet, 'quartz').ok, true); assert.equal(wallet.fossils, 6);
assert.equal(convertCurrency(wallet, 'fossils').ok, true); assert.equal(wallet.oil, 1);
assert.equal(convertCurrency(wallet, 'oil').reason, 'top currency');
assert.equal(convertCurrency(wallet, 'opal', -1).reason, 'reverse conversion not defined by canonical master economy');
assert.match(walletSummary(wallet), /Fossils/); assert.doesNotMatch(walletSummary(wallet), /Diamond/);
console.log('high-res sourced economy: ok');
