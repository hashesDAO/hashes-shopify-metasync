const fs = require('fs');

// Set to whatever the address for tokengating is
const tokenGateAddress = '0xe9ae9194277ac8b23065cd19933ba3db68fd753e';

// This should be the bearer token for the account that is issuing the COAs
const bearerToken = '';

const headers = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.5',
  authorization: bearerToken,
  'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Brave";v="110"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'sec-gpc': '1',
  Referer: 'https://verisart.com/',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// main function here. Will get all token gate info for all orders
async function saveCertInfos() {
  const editions = await getAllEditions();
  await allCertsFromEditions(editions);
}

// gets all editions that were created by the act
async function getAllEditions() {
  const certs = await getAllCertsForAct();
  const editionIds = [];

  for (let i = 0; i < certs.length; i++) {
    editionIds.push(certs[i].editionGrouped.id);
  }

  return editionIds;
}

// get full cert for all certs in each edition
async function allCertsFromEditions(editions) {
  const finalObj = [];

  for (let i = 0; i < editions.length; i++) {
    await getCertsFromEdition(editions[i]).then(async (edition) => {
      for (let j = 0; j < edition.certificates.length; j++) {
        const cert = await getFullCert(edition.certificates[j].id);
        finalObj.push(cert);
      }
    });
  }

  fs.writeFile('certs.json', JSON.stringify(finalObj), 'utf8', function (err) {
    if (err) throw err;
  });
}

// all certs issued from a given edition
async function getCertsFromEdition(editionId) {
  // Update size to editions size if needed. Very dumb they're not using continuation tokens
  return await fetch(
    `https://api.verisart.com/v3/edition/${editionId}?size=250`,
    {
      headers: headers,
      method: 'GET',
    }
  ).then(async (res) => {
    return await res.json();
  });
}

async function generateMetadataInfo() {
  const tokens = [];
  const certs = JSON.parse(parseStoredCerts());

  for (let i = 0; i < certs.length; i++) {
    try {
      const tokenGateInfo = certs[i].versions[0].private.product.tokenGate;

      if (tokenGateInfo !== null) {
        const token = {
          tokenGateAddress: tokenGateAddress,
          tokenId: tokenGateInfo.tokenId,
          url: certs[i].canonicalUrl,
        };
        if (!tokens.includes(token)) {
          tokens.push(token);
        }
      }
    } catch (e) {}
  }
  fs.writeFile('metadata.json', JSON.stringify(tokens), 'utf8', function (err) {
    if (err) throw err;
  });
}

async function getAllCertsNotAssignedToken() {
  const schematicCoas = [];
  const blossomingCoas = [];
  const mehretuCoas = [];

  const certs = JSON.parse(parseStoredCerts());

  for (let i = 0; i < certs.length; i++) {
    try {
      const tokenGateInfo = certs[i].versions[0].private.product.tokenGate;

      if (tokenGateInfo === null) {
        if (certs[i].versions[0].private.product.orderName === null) {
          console.log('missing one found');
        }
        const type = certs[i].versions[0].public.title;
        const token = {
          orderName: certs[i].versions[0].private.product.orderName,
          url: certs[i].canonicalUrl,
        };

        if (type === 'Mehretu' && !mehretuCoas.includes(token)) {
          mehretuCoas.push(token);
        } else if (type === 'Schematic' && !schematicCoas.includes(token)) {
          schematicCoas.push(token);
        } else if (
          type === 'Blossoming Cadaver' &&
          !blossomingCoas.includes(token)
        ) {
          blossomingCoas.push(token);
        }
      }
    } catch (e) {}
  }

  console.log(`Schematic count: ${schematicCoas.length}`);
  console.log(`Blossoming count: ${blossomingCoas.length}`);
  console.log(`Meh count: ${mehretuCoas.length}`);

  fs.writeFile(
    'schematic.json',
    JSON.stringify(schematicCoas),
    'utf8',
    function (err) {
      if (err) throw err;
    }
  );
  fs.writeFile(
    'blossoming.json',
    JSON.stringify(blossomingCoas),
    'utf8',
    function (err) {
      if (err) throw err;
    }
  );
  fs.writeFile(
    'mehretu.json',
    JSON.stringify(mehretuCoas),
    'utf8',
    function (err) {
      if (err) throw err;
    }
  );
}

// parses stored certs file
function parseStoredCerts() {
  return fs.readFileSync('certs.json', 'utf8');
}

async function getAllCertsForAct() {
  return await fetch(
    'https://api.verisart.com/v3/certificate?size=25&filter=ALL&sort=UPDATED_AT',
    {
      headers: headers,
      method: 'GET',
    }
  ).then(async (res) => {
    return await res.json();
  });
}

async function getFullCert(certId) {
  return await fetch(`https://api.verisart.com/v3/certificate/${certId}`, {
    headers: headers,
    method: 'GET',
  }).then(async (res) => {
    return await res.json();
  });
}

async function getCertTransfer(certId) {
  return await fetch(
    `https://api.verisart.com/v3/certificate/${certId}/transfer`,
    {
      headers: headers,
      method: 'GET',
    }
  ).then(async (res) => {
    return await res.json();
  });
}

async function loadStoredMetadata() {
  return fs.readFileSync('metadata.json', 'utf8');
}

(async () => {
  await getAllCertsNotAssignedToken();
})().catch((e) => {
  console.error(e);
});
