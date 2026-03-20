import {
  isConnected,
  requestAccess,
  signTransaction,
} from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID || 'PLACEHOLDER_CONTRACT_ID';
const RPC_URL = 'https://soroban-testnet.stellar.org:443';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const server = new StellarSdk.SorobanRpc.Server(RPC_URL);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns a dummy Account object suitable for read-only simulations.
 * simulateTransaction does NOT require the account to exist on-chain;
 * it just needs a valid XDR envelope, so sequence "0" is fine.
 */
const SIMULATION_SOURCE_ACCOUNT =
  'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';

const getDummySource = () =>
  new StellarSdk.Account(SIMULATION_SOURCE_ACCOUNT, '0');

/**
 * Build, prepare, sign with Freighter, and submit a Soroban transaction.
 * @param {string} publicKey - connected wallet address
 * @param {StellarSdk.xdr.Operation} operation - contract call operation
 */
const buildSignAndSubmit = async (publicKey, operation) => {
  const sourceAccount = await server.getAccount(publicKey);

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '1000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);

  const signedXdr = await signTransaction(preparedTx.toXDR(), {
    network: 'TESTNET',
  });

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const response = await server.sendTransaction(signedTx);

  if (response.status === 'PENDING') {
    let txStatus = await server.getTransaction(response.hash);
    let attempts = 0;
    while (txStatus.status === 'NOT_FOUND' && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      txStatus = await server.getTransaction(response.hash);
      attempts++;
    }
    if (txStatus.status === 'SUCCESS') return txStatus;
    throw new Error('Transaction failed or went missing after 10 attempts.');
  }

  return response;
};

/**
 * Simulate a read-only contract call and return the native JS value.
 * @param {StellarSdk.xdr.Operation} operation
 */
const simulateReadOnly = async (operation) => {
  const tx = new StellarSdk.TransactionBuilder(getDummySource(), {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
    return StellarSdk.scValToNative(simulation.result.retval);
  }

  throw new Error(
    'Simulation failed: ' + (simulation.error || 'Unknown error')
  );
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

/**
 * Connect to Freighter Wallet and return the public key.
 * @returns {Promise<string>} Stellar public key
 */
export const connectFreighter = async () => {
  const connected = await isConnected();
  if (!connected) {
    throw new Error(
      'Freighter is not installed. Please install the Freighter browser extension.'
    );
  }
  return await requestAccess();
};

// ─── Report Functions ─────────────────────────────────────────────────────────

/**
 * Add a report hash to the Soroban contract (requires wallet signature).
 * @param {string} publicKey - connected doctor's wallet address
 * @param {string} patientId - patient identifier
 * @param {string} reportHash - SHA-256 hex hash of the file
 * @param {string} description - human-readable description
 */
export const addReport = async (publicKey, patientId, reportHash, description) => {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const operation = contract.call(
    'add_report',
    StellarSdk.nativeToScVal(patientId, { type: 'string' }),
    StellarSdk.nativeToScVal(reportHash, { type: 'string' }),
    new StellarSdk.Address(publicKey).toScVal(),
    StellarSdk.nativeToScVal(description, { type: 'string' })
  );
  return buildSignAndSubmit(publicKey, operation);
};

/**
 * Verify a report hash exists for a patient on-chain (read-only).
 * @returns {Promise<boolean>}
 */
export const verifyReport = async (patientId, reportHash) => {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const operation = contract.call(
      'verify_report',
      StellarSdk.nativeToScVal(patientId, { type: 'string' }),
      StellarSdk.nativeToScVal(reportHash, { type: 'string' })
    );
    return await simulateReadOnly(operation);
  } catch (error) {
    console.error('verifyReport error:', error);
    return false;
  }
};

/**
 * Get all reports for a patient (read-only).
 * @returns {Promise<Array>}
 */
export const getReports = async (patientId) => {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const operation = contract.call(
      'get_reports',
      StellarSdk.nativeToScVal(patientId, { type: 'string' })
    );
    const result = await simulateReadOnly(operation);
    return result || [];
  } catch (error) {
    console.error('getReports error:', error);
    return [];
  }
};

/**
 * Get the chronologically ordered medical timeline for a patient (read-only).
 * @returns {Promise<Array>}
 */
export const getMedicalTimeline = async (patientId) => {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const operation = contract.call(
      'get_medical_timeline',
      StellarSdk.nativeToScVal(patientId, { type: 'string' })
    );
    const result = await simulateReadOnly(operation);
    return result || [];
  } catch (error) {
    console.error('getMedicalTimeline error:', error);
    return [];
  }
};

// ─── Patient Identity ─────────────────────────────────────────────────────────

/**
 * Register a patient identity on-chain (requires wallet signature).
 */
export const registerPatientIdentity = async (
  publicKey,
  patientId,
  bloodType,
  allergies,
  emergencyContact
) => {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const operation = contract.call(
    'register_patient_identity',
    StellarSdk.nativeToScVal(patientId, { type: 'string' }),
    new StellarSdk.Address(publicKey).toScVal(),
    StellarSdk.nativeToScVal(bloodType, { type: 'string' }),
    StellarSdk.nativeToScVal(allergies, { type: 'string' }),
    StellarSdk.nativeToScVal(emergencyContact, { type: 'string' })
  );
  return buildSignAndSubmit(publicKey, operation);
};

/**
 * Get patient identity data (read-only).
 * @returns {Promise<object>}
 */
export const getPatientIdentity = async (patientId) => {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const operation = contract.call(
      'get_patient_identity',
      StellarSdk.nativeToScVal(patientId, { type: 'string' })
    );
    return await simulateReadOnly(operation);
  } catch (error) {
    console.error('getPatientIdentity error:', error);
    return null;
  }
};

// ─── Privacy Access ───────────────────────────────────────────────────────────

/**
 * Grant privacy access to another address for a patient's records (requires wallet signature).
 * @param {string} publicKey - patient's wallet (owner)
 * @param {string} patientId
 * @param {string} granteeAddress - Stellar address to grant access to
 * @param {number} daysValid - days the grant is valid
 */
export const grantPrivacyAccess = async (
  publicKey,
  patientId,
  granteeAddress,
  daysValid
) => {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const operation = contract.call(
    'grant_privacy_access',
    StellarSdk.nativeToScVal(patientId, { type: 'string' }),
    new StellarSdk.Address(granteeAddress).toScVal(),
    StellarSdk.nativeToScVal(daysValid, { type: 'u64' })
  );
  return buildSignAndSubmit(publicKey, operation);
};

/**
 * Check whether a given address has privacy access for a patient (read-only).
 * @returns {Promise<boolean>}
 */
export const verifyPrivacyAccess = async (patientId, requester) => {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const operation = contract.call(
      'verify_privacy_access',
      StellarSdk.nativeToScVal(patientId, { type: 'string' }),
      new StellarSdk.Address(requester).toScVal()
    );
    return await simulateReadOnly(operation);
  } catch (error) {
    console.error('verifyPrivacyAccess error:', error);
    return false;
  }
};
