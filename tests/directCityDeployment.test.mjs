import assert from 'node:assert/strict';
import {
  deployToCity,
  normalizeDeploymentPacket,
  waitForCityInstall
} from '../src/modules/directCityDeployment.js';

const frame = {
  contentWindow: {
    async RM_CITY_INSTALL(packet, deploymentId) {
      return { ready: true, name: packet.name, deploymentId };
    }
  }
};

assert.equal(normalizeDeploymentPacket({ name: 'Giga' }).name, 'Giga');
const deployed = await deployToCity({ frame, rawPacket: { name: 'Giga' }, deploymentId: 'd-1', timeoutMs: 10 });
assert.equal(deployed.phase, 'ready');
assert.equal(deployed.result.deploymentId, 'd-1');

await assert.rejects(
  () => deployToCity({ frame: { contentWindow: { async RM_CITY_INSTALL() { return { ready: false }; } } }, rawPacket: {}, timeoutMs: 10 }),
  /ready=true/
);

await assert.rejects(
  () => waitForCityInstall({ contentWindow: {} }, { timeoutMs: 4, pollMs: 1 }),
  /did not expose/
);
console.log('direct city deployment: ok');
