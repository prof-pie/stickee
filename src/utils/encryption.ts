// Simple obfuscation for note content (base64 of UTF-8 bytes).
// Not military-grade encryption — keeps casual DB readers from reading notes in plain text.

const CHUNK = 0x8000; // avoid call-stack limits with String.fromCharCode(...bigArray)

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function looksLikeBase64(value: string): boolean {
  // Loose check: valid base64 alphabet + length multiple of 4 after padding.
  if (!value || value.length < 4) return false;
  if (/\s/.test(value)) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0;
}

export function encryptContent(content: string): string {
  if (!content) return content;

  try {
    const data = new TextEncoder().encode(content);
    return bytesToBase64(data);
  } catch (error) {
    console.error("Encryption error:", error);
    // Never silently return plaintext on failure — rethrow so save fails loudly
    // rather than writing a mix of plain/encrypted rows that break on reload.
    throw error instanceof Error ? error : new Error("Failed to encrypt note content");
  }
}

export function decryptContent(encryptedContent: string): string {
  if (!encryptedContent) return encryptedContent;

  // Rows that were stored as plaintext (legacy / failed encrypt) pass through.
  if (!looksLikeBase64(encryptedContent)) {
    return encryptedContent;
  }

  try {
    const bytes = base64ToBytes(encryptedContent);
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error("Decryption error:", error);
    // If it looked like base64 but wasn't our payload, show original rather than empty.
    return encryptedContent;
  }
}

export function encryptTitle(title?: string): string | undefined {
  if (!title) return title;
  return encryptContent(title);
}

export function decryptTitle(encryptedTitle?: string): string | undefined {
  if (!encryptedTitle) return encryptedTitle;
  return decryptContent(encryptedTitle);
}
