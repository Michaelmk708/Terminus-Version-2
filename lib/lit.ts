import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";

const chain = "solana";

// 1. Initialize the Lit Network Client (Datil-dev for testnet)
export const getLitNodeClient = async () => {
  const litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilDev,
    debug: false,
  });
  await litNodeClient.connect();
  return litNodeClient;
};

// 2. The Argust Trust + Next of Kin Dual Condition
const getArgustAccessControl = (
  nextOfKinAddress: string,
  argustPdaAddress: string,
  expectedUnlockHash: string
) => {
  return [
    // Condition A: The wallet trying to decrypt MUST be the Next of Kin
    {
      method: "",
      params: [":userAddress"],
      prmV2: "",
      chain,
      returnValueTest: {
        comparator: "=",
        value: nextOfKinAddress,
      },
    },
    // The "AND" operator means BOTH conditions must be strictly true
    { operator: "and" },
    // Condition B: The Argust Trust PDA on Solana MUST contain the specific "UNLOCKED" hash
    {
      method: "getAccountInfo",
      // Requesting the Solana RPC to fetch the Argust PDA data encoded in base58 or base64
      params: [argustPdaAddress, { encoding: "base64" }],
      prmV2: "solana",
      chain,
      returnValueTest: {
        // Lit parses the JSON RPC response. We check the data array.
        key: "$.data[0]", 
        comparator: "contains", // Using contains allows us to find the hash anywhere in the Argust PDA buffer
        value: expectedUnlockHash, 
      },
    },
  ];
};

// 3. Encrypt the Payload using the Argust Trust Condition
export const encryptWithArgustProvenance = async (
  plaintext: string,
  nextOfKinAddress: string,
  argustPdaAddress: string, // The specific Solana PDA Argust generates for this vault
  expectedUnlockHash: string, // The SHA-256 hash FastAPI will anchor when the timer hits 0
  walletSignMessageFn: (message: Uint8Array) => Promise<Uint8Array>,
  publicKey: string
) => {
  const litNodeClient = await getLitNodeClient();
  const accessControlConditions = getArgustAccessControl(
    nextOfKinAddress,
    argustPdaAddress,
    expectedUnlockHash
  );

  // Authenticate the Vault Owner's session via their wallet signature
  const authMessage = `Sign this message to seal your legacy vault via Lit Protocol. \n\nTimestamp: ${Date.now()}`;
  const encodedMessage = new TextEncoder().encode(authMessage);
  const signature = await walletSignMessageFn(encodedMessage);
  
  const authSig = {
    sig: Buffer.from(signature).toString("hex"),
    derivedVia: "solana.signMessage",
    signedMessage: authMessage,
    address: publicKey,
  };

  // Encrypt the string and tie it to the Argust PDA
  const { ciphertext, dataToEncryptHash } = await litNodeClient.encryptString({
    accessControlConditions,
    authSig,
    chain,
    dataToEncrypt: plaintext,
  });

  return { ciphertext, dataToEncryptHash };
};