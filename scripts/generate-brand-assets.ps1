Add-Type -AssemblyName System.Drawing

$sourcePath = "public/brand/WhatsApp Image 2026-10-24 at 12.45.41 PM.jpeg"
$srcImg = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePath))

if (-not (Test-Path "brand")) {
    New-Item -ItemType Directory -Path "brand" | Out-Null
}

function Resize-Image($img, $width, $height, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $width, $height)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

# 1. 1024px PNG
Resize-Image $srcImg 1024 1024 "brand/logo-1024.png"
Resize-Image $srcImg 1024 1024 "public/brand/logo-1024.png"

# 2. 512px PNG
Resize-Image $srcImg 512 512 "brand/logo-512.png"
Resize-Image $srcImg 512 512 "public/brand/logo-512.png"
Resize-Image $srcImg 512 512 "public/icon-512.png"

# 3. 192px PNG
Resize-Image $srcImg 192 192 "public/icon-192.png"

# 4. Apple Touch Icon 180px
Resize-Image $srcImg 180 180 "public/apple-touch-icon.png"

# 5. 32px & 16px Favicons
Resize-Image $srcImg 32 32 "public/favicon-32x32.png"
Resize-Image $srcImg 16 16 "public/favicon-16x16.png"

# 6. Favicon.ico
$icoBmp = New-Object System.Drawing.Bitmap 32, 32
$gIco = [System.Drawing.Graphics]::FromImage($icoBmp)
$gIco.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gIco.DrawImage($srcImg, 0, 0, 32, 32)
$gIco.Dispose()
$hIcon = $icoBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream "public/favicon.ico", ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icoBmp.Dispose()

# 7. 1200x630 OG Share Image
$ogBmp = New-Object System.Drawing.Bitmap 1200, 630
$gOg = [System.Drawing.Graphics]::FromImage($ogBmp)
$gOg.Clear([System.Drawing.ColorTranslator]::FromHtml("#F6F3EE"))
$gOg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gOg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Draw logo
$logoSize = 280
$logoX = 100
$logoY = [int]((630 - $logoSize) / 2)
$gOg.DrawImage($srcImg, $logoX, $logoY, $logoSize, $logoSize)

# Draw title and subtitle
$titleFont = New-Object System.Drawing.Font "Arial", 46, ([System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font "Arial", 22, ([System.Drawing.FontStyle]::Regular)
$navyBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#111214"))
$mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#6B7280"))
$accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#C8341B"))

$gOg.DrawString("Orvane Works", $titleFont, $navyBrush, 430, 210)
$gOg.DrawString("Student-Founded Freelance Studio in Madurai", $subFont, $accentBrush, 432, 285)
$gOg.DrawString("Web Development • Video Editing • Brand Assets", $subFont, $mutedBrush, 432, 335)

$titleFont.Dispose()
$subFont.Dispose()
$navyBrush.Dispose()
$mutedBrush.Dispose()
$accentBrush.Dispose()
$gOg.Dispose()

$ogBmp.Save("public/og-image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$ogBmp.Dispose()
$srcImg.Dispose()

Write-Output "Brand assets successfully generated."
