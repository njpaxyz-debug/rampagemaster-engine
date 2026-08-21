import assert from 'node:assert/strict';
import { createProgressionWallet, convertProgressionCurrency, purchaseMasterShopItem } from '../src/modules/economyProgression.js';

const master = createProgressionWallet('master20260509', { bones: 100, opal: 25, quartz: 12, fossils: 5 });
assert.equal(convertProgressionCurrency(master, 'bo', 1).ok, true); assert.equal(master.opal, 26);
assert.equal(convertProgressionCurrency(master, 'oq', 1).ok, true); assert.equal(master.quartz, 13);
assert.equal(convertProgressionCurrency(master, 'qf', 1).ok, true); assert.equal(master.fossils, 6);
assert.equal(convertProgressionCurrency(master, 'fo', 1).ok, true); assert.equal(master.oil, 1);
const vault = createProgressionWallet('master20260509', { bones: 88 }); assert.equal(convertProgressionCurrency(vault, 'bo', 1, { vaultDiscount: true }).unitCost, 88);
const market = createProgressionWallet('marketV12', { opal: 50, quartz: 25, petrol: 10 }); assert.equal(convertProgressionCurrency(market, 'oq').gained, 1); assert.equal(convertProgressionCurrency(market, 'qp').gained, 1); assert.equal(convertProgressionCurrency(market, 'pd').gained, 1);
const shop = { wallet: { bones: 45, opal: 0, quartz: 0, fossils: 0, oil: 0 }, inventory: {}, upgrades: {}, skins: {} };
const bought = purchaseMasterShopItem(shop, 'snack'); assert.equal(bought.ok, true); assert.equal(shop.inventory.snack, 3); assert.equal(shop.wallet.bones, 0);
console.log('economy progression: ok');
