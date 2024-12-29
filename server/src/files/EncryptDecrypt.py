from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.serialization import load_pem_public_key, load_pem_private_key
import base64

# Load the public key from a PEM file
def load_public_key(pem_path):
    with open(pem_path, 'rb') as pem_file:
        public_key = load_pem_public_key(pem_file.read())
    return public_key

# Load the private key from a PEM file
def load_private_key(pem_path):
    with open(pem_path, 'rb') as pem_file:
        private_key = load_pem_private_key(pem_file.read(), password=None)
    return private_key

# RSA encryption using the public key
def rsa_encrypt(public_key, message):
    ciphertext = public_key.encrypt(
        message.encode('utf-8'),
        padding.PKCS1v15()  # RSA with PKCS#1 v1.5 padding
    )
    return base64.b64encode(ciphertext).decode('utf-8')

# RSA decryption using the private key
def rsa_decrypt(private_key, encrypted_message):
    ciphertext = base64.b64decode(encrypted_message)
    plaintext = private_key.decrypt(
        ciphertext,
        padding.PKCS1v15()  # RSA with PKCS#1 v1.5 padding
    )
    return plaintext.decode('utf-8')

if __name__ == "__main__":
    # File paths for the public and private keys
    public_key_path = "./JudgePublicKey.pem"
    private_key_path = "./JudgePrivateKey.pem"

    # The message to encrypt
    message = "GRDNNA66L65B034A"

    try:
        # Load the public and private keys
        public_key = load_public_key(public_key_path)
        private_key = load_private_key(private_key_path)

        # Encrypt the message
        encrypted_message = rsa_encrypt(public_key, message)
        print(f"Encrypted Message (Base64): {encrypted_message}")

        # Decrypt the message
        decrypted_message = rsa_decrypt(private_key, encrypted_message)
        print(f"Decrypted Message: {decrypted_message}")

    except Exception as e:
        print(f"An error occurred: {e}")
