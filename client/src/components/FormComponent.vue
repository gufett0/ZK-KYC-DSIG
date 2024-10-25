<template>
  <InputGroup>
    <InputGroupAddon>
      <i class="pi pi-user"></i>
    </InputGroupAddon>
    <InputText v-model="name" placeholder="Name" />
  </InputGroup>

  <InputGroup>
    <InputGroupAddon>
      <i class="pi pi-user"></i>
    </InputGroupAddon>
    <InputText v-model="surname" placeholder="Surname" />
  </InputGroup>

  <InputGroup>
    <InputGroupAddon>
      <i class="pi pi-user"></i>
    </InputGroupAddon>
    <InputText v-model="fiscalCode" placeholder="Fiscal Code" />
  </InputGroup>

  <!-- Display the formatted JSON -->
  <label>
    <h3>Original JSON</h3>
    <pre>{{ formattedJson }}</pre>
  </label>

  <!-- Button to trigger encryption -->
  <button @click="encryptJson">Encrypt JSON</button>

  <!-- Display the public and private keys -->
  <label>
    <h3>Public Key</h3>
    <pre>{{ publicKeyPem }}</pre>
  </label>

  <label>
    <h3>Private Key</h3>
    <pre>{{ privateKeyPem }}</pre>
  </label>

  <!-- Display the encrypted JSON -->
  <label>
    <h3>Encrypted JSON</h3>
    <pre>{{ encryptedJson }}</pre>
  </label>

  <!-- Display the decrypted JSON -->
  <label>
    <h3>Decrypted JSON</h3>
    <pre>{{ decryptedJson }}</pre>
  </label>
  <!-- Button to trigger encryption -->
  <button @click="downloadPdf">Download Pdf</button>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import Cryptography from "../entities/cryptography";
import Pdf from "../entities/pdf";
import FileUpload from "primevue/fileupload";
//TODO sanitize input

// Input fields
const name = ref("Name");
const surname = ref("Surname");
const fiscalCode = ref("Fiscal Code");

// Computed property to create JSON from input fields
const jsonData = computed(() => ({
  Name: name.value,
  Surname: surname.value,
  FiscalCode: fiscalCode.value,
}));

const formattedJson = computed(() => JSON.stringify(jsonData.value, null, 2));

// Variables to store keys and encrypted/decrypted data
const encryptedJson = ref<string | null>(null);
const decryptedJson = ref<string | null>(null);
const publicKey = ref<CryptoKey | null>(null);
const privateKey = ref<CryptoKey | null>(null);

const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1bkp26pCl7FI+WJ8Vg7Y
xtQInThK3mgyvru9AMnj8q0x8gQBiID/jJSlCemTnw5eoBgZF8H4KqErN7dSsRma
yDqMUZWLcXbURs//m62ESfcFEeGW9FEGm/pdJBC6Og/xQ+LUvfurgiETW0P3Nh4q
B1IYmjQeVv5q397X6xszemzRvXo1Fjn3fXGDtdFROtp1oP/ErZBTbtH+IpzgQSuI
0YFiaN0ookfBJmTIG3Hd7WNu7GCaNFGMsy0diiavhfB3vJaZ0p7uPeA490O03VTh
HPxE9I2dlVkIqL+EHRsyWxiqHcl6DxHappDH6QC+xJ/pkiaDBfr4T7Z1hSyKPzml
FwIDAQAB
-----END PUBLIC KEY-----`;

const privateKeyPem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDVuSnbqkKXsUj5
YnxWDtjG1AidOEreaDK+u70AyePyrTHyBAGIgP+MlKUJ6ZOfDl6gGBkXwfgqoSs3
t1KxGZrIOoxRlYtxdtRGz/+brYRJ9wUR4Zb0UQab+l0kELo6D/FD4tS9+6uCIRNb
Q/c2HioHUhiaNB5W/mrf3tfrGzN6bNG9ejUWOfd9cYO10VE62nWg/8StkFNu0f4i
nOBBK4jRgWJo3SiiR8EmZMgbcd3tY27sYJo0UYyzLR2KJq+F8He8lpnSnu494Dj3
Q7TdVOEc/ET0jZ2VWQiov4QdGzJbGKodyXoPEdqmkMfpAL7En+mSJoMF+vhPtnWF
LIo/OaUXAgMBAAECggEAXNG+dprCshu6PCjEJCHtjqh+lz1f8qihRUnGw2VrHLWQ
Z/HKcqzHj5fs91mclasJeJEOsM06iNUXLmrtPGII4WXgE/yVI3F+rsRd2BArUG46
IvJs+22HJ827jtK+9kF/QELurxXyfiD8RZpGbpf6G9TRP4NcG98BrnmbH43gNQ3q
xk/O66QDsR4hcBKDekD6B71dgHpDo3cdSLoCOC9DriVYk81g7c39Ym7w3jdFEo/b
TluhcN480DXen89s5ZlZ0cJjMwRuH9DTNQxpfUin81N5x2w9voq4Oxrm4rPtY65k
BnrZ2kcBe8VR0vTlBaIb9GUBWrVLeGBYx/UfkD8UbQKBgQD+N3mWtslmevfqvvyx
PMDLoaQOOEMs1UOQxkqSxGDU+m8/CuJZggtGgY74Fwu1py8UGeGwO6HAfhQKrRXg
7QpktDRu/PlNCejixAhR8nbUnd+NsxAhrcexJnH58O545CFyQ36ypt3IHYKVfFLw
jnUAz0MODGITNU2pn1mxEZM1AwKBgQDXOPhWWfsTVfPdizgEFCHWWdQJQtT+uLlK
r0AvJeJ2TnX5B5cHYjEuOFfYRcSwcLid9CYB16BoJXpLYc2OCl964mPEyB0pnNla
oqy20H6r1uyRhpM8NX13bBzfKJ6AXQz1w4mkO9TTND7dPdpJdvBWbbsdhF+RdrXd
/K3RlE4hXQKBgGV+Vm/imDPvAk3ZZF+KhtqFtU7sDX23w1ron9tKxfIh7go4WTgt
ID1M+nx4Dve+QKCA2McYd7K3Y18DzYlYed7Mx2ZMX2fvfegTJdM5v1GRmjAjflxD
2kcSt0x3cW4YfnX1Fn9S+ZasmXb/BMn/xhzFotrX/Mv4awI+mXuFLcVrAoGARpex
HOG2sMjojCo13WCdGKmuGruJEWOVoyGIc+6BMTzbBSuwJgPXDcn9RjrcIONYKrcC
IGiRfJeOXVtfCM/uMWhAQTNCHXwM7uWcsPoCEmsUfUce1AjXdmxHrAqusnvS3Gme
o/fb/sqMNBUtnBsfCbpEPZJFpnjBfmZ6vNtgJSECgYEAiFd5I9sY9CWjg5i5J43O
Rtle6rQhBfmBzALixhh8vc12zIyhZG9az7MVUVqo4UwTEygdoHyBIP89cmoDhUJu
BPkiTV1t1QTGgjDQtLmUHqv6odMw96TXAVj4SgGL0mEWcWHf2QOnMyo+YUoyOrbn
PaV+T1HG4b/cNL062Axupjw=
-----BEGIN PRIVATE KEY-----`;

// Function to load keys
const loadKeys = async () => {
  try {
    publicKey.value = await Cryptography.importPublicKey(publicKeyPem);
    console.log(publicKey.value);
    console.log("FATTO");
    privateKey.value = await Cryptography.importPrivateKey(privateKeyPem);
    console.log(privateKey.value);
    console.log("FATTO2");
  } catch (error) {
    console.error("Error loading keys:", error);
  }
};

// Function to encrypt JSON
const encryptJson = async () => {
  if (!publicKey.value || !privateKey.value) {
    await loadKeys();
  }

  if (publicKey.value) {
    try {
      encryptedJson.value = await Cryptography.encryptData(publicKey.value, formattedJson.value);
      await decryptJson();
    } catch (error) {
      console.error("Error encrypting JSON:", error);
    }
  }
};

// Function to decrypt JSON
const decryptJson = async () => {
  if (!privateKey.value) {
    await loadKeys();
  }

  if (privateKey.value && encryptedJson.value) {
    try {
      decryptedJson.value = await Cryptography.decryptData(privateKey.value, encryptedJson.value);
    } catch (error) {
      console.error("Error decrypting JSON:", error);
    }
  }
};

const downloadPdf = async () => {
  try {
    if (!encryptedJson.value) {
      console.error("No encrypted data available to include in the PDF.");
      return;
    }

    // Crea il PDF con il testo crittografato
    const pdfBytes = await Pdf.createPdf(encryptedJson.value);

    // Scarica il PDF
    Pdf.downloadPdf(pdfBytes, "encryptedDataPdf.pdf");
  } catch (error) {
    console.error("Error creating or downloading the PDF:", error);
  }
};

// Load keys when the component is mounted
onMounted(loadKeys);
</script>
