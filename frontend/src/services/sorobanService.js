import {
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  Account,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

// ─── CONFIG ─────────────────────────────────────────────────────

const CONTRACT_ID =
  process.env.REACT_APP_CONTRACT_ID || "PLACEHOLDER_CONTRACT_ID";

const RPC_URL = "https://soroban-testnet.stellar.org:443";
const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new SorobanRpc.Server(RPC_URL);

// ─── HELPERS ────────────────────────────────────────────────────

// Dummy account for read-only simulation
const SIMULATION_SOURCE_ACCOUNT =
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

const getDummySource = () => new Account(SIMULATION_SOURCE_ACCOUNT, "0");

// ─── CORE TX BUILDER ────────────────────────────────────────────

const buildSignAndSubmit = async (publicKey, operation) => {
  const sourceAccount = await server.getAccount(publicKey);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: "1000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);

  const signedXdr = await signTransaction(preparedTx.toXDR(), {
    network: "TESTNET",
  });

  const signedTx = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const response = await server.sendTransaction(signedTx);

  if (response.status === "PENDING") {
    let txStatus = await server.getTransaction(response.hash);
    let attempts = 0;

    while (txStatus.status === "NOT_FOUND" && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      txStatus = await server.getTransaction(response.hash);
      attempts++;
    }

    if (txStatus.status === "SUCCESS") return txStatus;

    throw new Error("Transaction failed or not found.");
  }

  return response;
};

// ─── READ-ONLY SIMULATION ───────────────────────────────────────

const simulateReadOnly = async (operation) => {
  const tx = new TransactionBuilder(getDummySource(), {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationSuccess(simulation)) {
    return scValToNative(simulation.result.retval);
  }

  throw new Error("Simulation failed");
};

// ─── WALLET ─────────────────────────────────────────────────────

export const connectFreighter = async () => {
  const connected = await isConnected();

  if (!connected) {
    throw new Error("Freighter wallet not installed.");
  }

  return await requestAccess();
};

// ─── REPORT FUNCTIONS ───────────────────────────────────────────

export const addReport = async (
  publicKey,
  patientId,
  reportHash,
  description
) => {
  const contract = new Contract(CONTRACT_ID);

  const operation = contract.call(
    "add_report",
    nativeToScVal(patientId, { type: "string" }),
    nativeToScVal(reportHash, { type: "string" }),
    new Address(publicKey).toScVal(),
    nativeToScVal(description, { type: "string" })
  );

  return buildSignAndSubmit(publicKey, operation);
};

export const verifyReport = async (patientId, reportHash) => {
  try {
    const contract = new Contract(CONTRACT_ID);

    const operation = contract.call(
      "verify_report",
      nativeToScVal(patientId, { type: "string" }),
      nativeToScVal(reportHash, { type: "string" })
    );

    return await simulateReadOnly(operation);
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getReports = async (patientId) => {
  try {
    const contract = new Contract(CONTRACT_ID);

    const operation = contract.call(
      "get_reports",
      nativeToScVal(patientId, { type: "string" })
    );

    return (await simulateReadOnly(operation)) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getMedicalTimeline = async (patientId) => {
  try {
    const contract = new Contract(CONTRACT_ID);

    const operation = contract.call(
      "get_medical_timeline",
      nativeToScVal(patientId, { type: "string" })
    );

    return (await simulateReadOnly(operation)) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ─── PATIENT IDENTITY ───────────────────────────────────────────

export const registerPatientIdentity = async (
  publicKey,
  patientId,
  bloodType,
  allergies,
  emergencyContact
) => {
  const contract = new Contract(CONTRACT_ID);

  const operation = contract.call(
    "register_patient_identity",
    nativeToScVal(patientId, { type: "string" }),
    new Address(publicKey).toScVal(),
    nativeToScVal(bloodType, { type: "string" }),
    nativeToScVal(allergies, { type: "string" }),
    nativeToScVal(emergencyContact, { type: "string" })
  );

  return buildSignAndSubmit(publicKey, operation);
};

export const getPatientIdentity = async (patientId) => {
  try {
    const contract = new Contract(CONTRACT_ID);

    const operation = contract.call(
      "get_patient_identity",
      nativeToScVal(patientId, { type: "string" })
    );

    return await simulateReadOnly(operation);
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ─── PRIVACY ACCESS ─────────────────────────────────────────────

export const grantPrivacyAccess = async (
  publicKey,
  patientId,
  granteeAddress,
  daysValid
) => {
  const contract = new Contract(CONTRACT_ID);

  const operation = contract.call(
    "grant_privacy_access",
    nativeToScVal(patientId, { type: "string" }),
    new Address(granteeAddress).toScVal(),
    nativeToScVal(daysValid, { type: "u64" })
  );

  return buildSignAndSubmit(publicKey, operation);
};

export const verifyPrivacyAccess = async (patientId, requester) => {
  try {
    const contract = new Contract(CONTRACT_ID);

    const operation = contract.call(
      "verify_privacy_access",
      nativeToScVal(patientId, { type: "string" }),
      new Address(requester).toScVal()
    );

    return await simulateReadOnly(operation);
  } catch (error) {
    console.error(error);
    return false;
  }
};