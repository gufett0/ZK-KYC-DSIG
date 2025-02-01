param(
    [string]$FiscalCode,
    [string]$FilesPath,
    [string]$DocumentPath
)

function Test-LastCommadExecution {
    param (
        [string] $message
    )
    if ($LASTEXITCODE -ne 0)
    {
        Write-Error $message
        exit 1
    }
}

function Generate-RootCA {
    $rootCAKeyFile = Join-Path $FilesPath "RootCA.key"
    $rootCAPemFile = Join-Path $FilesPath "RootCA.pem"
    $rootCACerFile = Join-Path $FilesPath "RootCA.cer"

    if (Test-Path $rootCACerFile) {
        Write-Host "Root CA already exists. Skipping generation."
        return
    }

    Write-Host "Generating new Root CA..."

    openssl genpkey -out $rootCAKeyFile -algorithm RSA -pkeyopt rsa_keygen_bits:2048
    Test-LastCommadExecution "Error generating Root CA key."

    openssl req -x509 -new -nodes -key $rootCAKeyFile -sha256 -days 3650 -subj "/C=IT/ST=Lazio/L=Rome/O=CustomRootCA/OU=RootCADept/CN=CustomRootCA" -out $rootCAPemFile
    Test-LastCommadExecution "Error generating Root CA certificate."

    openssl x509 -in $rootCAPemFile -outform DER -out $rootCACerFile
    Test-LastCommadExecution "Error converting Root CA certificate to DER format."

    Write-Host "Root CA generation complete."
}

function Generate-UserCertAndSign {
    Write-Host "Generating user certificate and signing file..."

    $userKeyFile = Join-Path $FilesPath "User.key"
    $userCsrFile = Join-Path $FilesPath "User.csr"
    $userCertFile = Join-Path $FilesPath "User.crt"

    $rootCAKeyFile = Join-Path $FilesPath "RootCA.key"
    $rootCAPemFile = Join-Path $FilesPath "RootCA.pem"

    openssl genpkey -out $userKeyFile -algorithm RSA -pkeyopt rsa_keygen_bits:2048
    Test-LastCommadExecution "Error generating user key."

    $subject = "/C=IT/ST=Lazio/L=Rome/O=MyCompany/OU=Dept/CN=RealUser/serialNumber=TINIT-$FiscalCode"

    openssl req -new -key $userKeyFile -subj $subject -out $userCsrFile
    Test-LastCommadExecution "Error generating user CSR."

    openssl x509 -req -in $userCsrFile -CA $rootCAPemFile -CAkey $rootCAKeyFile -CAcreateserial -out $userCertFile -days 1825 -sha256
    Test-LastCommadExecution "Error generating user certificate."

    $signedFilePath = "$DocumentPath.p7m"

    openssl cms -sign `
        -cades `
        -in $DocumentPath `
        -signer $userCertFile `
        -inkey $userKeyFile `
        -outform DER `
        -md sha256 `
        -binary `
        -nodetach `
        -out $signedFilePath
    Test-LastCommadExecution "Error signing file."
    
    Write-Host "File signed successfully -> $signedFilePath"
}

function Start-Process {
    Generate-RootCA
    Generate-UserCertAndSign
    Write-Host "OK"
}

Start-Process