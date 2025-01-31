param(
    [switch]$CertificateCA,  # Generate Root CA
    [switch]$Sign,           # Generate user certificate and sign document
    [string]$FiscalCode,     # Person's fiscal code
    [string]$RootCAPath,     # Root CA storage/lookup path
    [string]$DocumentPath    # Document path for signing
)

function Generate-RootCA {
    $certificateFile = "$RootCAPath\RootCA.cer"

    if (Test-Path $certificateFile) {
        Write-Host "OK"
        return
    }
    
    $ca = New-SelfSignedCertificate -Type Custom `
        -KeyAlgorithm RSA -KeyLength 2048 `
        -Subject "CN=CustomRootCA" `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -KeyExportPolicy Exportable `
        -NotAfter (Get-Date).AddYears(10) `
        -TextExtension "2.5.29.19={critical}{text}ca=true&pathlength=0"
    Export-Certificate -Cert $ca -FilePath $certificateFile
    Write-Host "OK"
}

function Generate-UserCertAndSign {
    # Import Root CA and create user cert
    $root = Import-Certificate -FilePath "$RootCAPath\RootCA.cer"
    $prefixFC = "TINIT-$FiscalCode"
    $userCert = New-SelfSignedCertificate -Type Custom `
        -KeyAlgorithm RSA -KeyLength 2048 `
        -Subject "CN=UserCert" `
        -Signer $root `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -NotAfter (Get-Date).AddYears(5) `
        -TextExtension "2.5.29.17={text}email=$prefixFC"

    # Sign document -> p7m
    $data = [System.IO.File]::ReadAllBytes($DocumentPath)
    $signed = New-Object System.Security.Cryptography.Pkcs.SignedCms
    $signed.ContentInfo = New-Object System.Security.Cryptography.Pkcs.ContentInfo($data)
    $signer = New-Object System.Security.Cryptography.Pkcs.CmsSigner($userCert)
    $signed.ComputeSignature($signer)
    [System.IO.File]::WriteAllBytes("$DocumentPath.p7m", $signed.Encode())
}

if ($CertificateCA) { Generate-RootCA }

if ($Sign -and $FiscalCode -and $RootCAPath -and $DocumentPath) {
    Generate-UserCertAndSign
}