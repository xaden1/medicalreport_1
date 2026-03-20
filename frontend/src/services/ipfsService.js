import axios from 'axios';

/**
 * Upload a file to IPFS via the Pinata pinning API.
 * Set REACT_APP_PINATA_JWT in your .env to enable real uploads.
 * Falls back to a simulated hash if the JWT is missing (dev mode).
 *
 * @param {File} file - browser File object
 * @returns {{ success: boolean, ipfsHash: string, pinataURL: string } | { success: false, error: string }}
 */
export const uploadToIPFS = async (file) => {
  const pinataJWT = process.env.REACT_APP_PINATA_JWT;

  if (!pinataJWT || pinataJWT === 'your_pinata_jwt_token_here') {
    console.warn(
      'No Pinata JWT configured (REACT_APP_PINATA_JWT). Using simulated IPFS hash.'
    );
    const fakeHash = 'QmSimulated' + Date.now();
    return {
      success: true,
      ipfsHash: fakeHash,
      pinataURL: `https://gateway.pinata.cloud/ipfs/${fakeHash}`,
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    // Do NOT set Content-Type manually — the browser needs to add the
    // multipart boundary automatically. Passing a manual boundary from
    // formData._boundary (a Node.js-only property) breaks browser uploads.
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
      }
    );

    return {
      success: true,
      ipfsHash: res.data.IpfsHash,
      pinataURL: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Compute a SHA-256 hash of a File object in the browser using the Web Crypto API.
 * @param {File} file
 * @returns {Promise<string>} lowercase hex string
 */
export const generateHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};
