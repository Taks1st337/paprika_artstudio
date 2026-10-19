<#
  Paprika Artstudio — підготовка фото майстер-класів

  Для кожної папки images/masterclasses/<slug>/:
  1. Розвертає фото з телефона, якщо воно «лежить на боці» (позначка EXIF Orientation).
  2. Зменшує фото, більші за 1600px по довшій стороні.
  3. Робить мініатюри до 600px у підпапці thumbs/ (для карток і галереї).
  4. Прибирає мініатюри, для яких уже немає фото.

  Окремо запускати не обов'язково — це робить node tools/build-masterclasses.js.
  Ручний запуск: powershell -ExecutionPolicy Bypass -File tools/resize-photos.ps1
#>

param(
  [string]$Root = (Join-Path $PSScriptRoot '..\images\masterclasses'),
  [int]$MaxSize = 1600,
  [int]$ThumbSize = 600,
  [long]$Quality = 82
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$OrientationId = 0x0112

# Завантажуємо фото в пам'ять, щоб файл не блокувався і його можна було перезаписати
function Read-Image([string]$Path) {
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $stream = New-Object System.IO.MemoryStream (, $bytes)
  return [System.Drawing.Image]::FromStream($stream)
}

# Розвертає зображення за позначкою EXIF і повертає $true, якщо щось змінилось
function Repair-Orientation($Image) {
  if ($Image.PropertyIdList -notcontains $OrientationId) { return $false }
  $value = $Image.GetPropertyItem($OrientationId).Value[0]
  $flip = switch ($value) {
    2 { 'RotateNoneFlipX' }
    3 { 'Rotate180FlipNone' }
    4 { 'Rotate180FlipX' }
    5 { 'Rotate90FlipX' }
    6 { 'Rotate90FlipNone' }
    7 { 'Rotate270FlipX' }
    8 { 'Rotate270FlipNone' }
    default { $null }
  }
  $Image.RemovePropertyItem($OrientationId)
  if (-not $flip) { return $false }
  $Image.RotateFlip([System.Drawing.RotateFlipType]::$flip)
  return $true
}

function Save-Scaled($Image, [string]$Path, [int]$Max, [bool]$AsPng) {
  $scale = [Math]::Min(1.0, $Max / [Math]::Max($Image.Width, $Image.Height))
  $w = [int][Math]::Round($Image.Width * $scale)
  $h = [int][Math]::Round($Image.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  if (-not $AsPng) { $g.Clear([System.Drawing.Color]::White) }
  $g.DrawImage($Image, 0, 0, $w, $h)
  $g.Dispose()
  if ($AsPng) {
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } else {
    $params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality
    $bmp.Save($Path, $jpegCodec, $params)
  }
  $bmp.Dispose()
  return "${w}x${h}"
}

$resized = 0; $thumbs = 0; $removed = 0

foreach ($dir in Get-ChildItem -Path $Root -Directory) {
  $thumbDir = Join-Path $dir.FullName 'thumbs'
  $photos = Get-ChildItem -Path $dir.FullName -File |
    Where-Object { $_.Extension -match '^\.(jpe?g|png)$' }

  foreach ($file in Get-ChildItem -Path $dir.FullName -File) {
    if ($file.Extension -match '^\.(heic|heif|webp)$') {
      Write-Output "SKIP $($dir.Name)/$($file.Name): format not supported, save it as JPG"
    }
  }

  foreach ($photo in $photos) {
    $isPng = $photo.Extension -eq '.png'
    $image = Read-Image $photo.FullName
    try {
      $rotated = Repair-Orientation $image
      $tooBig = [Math]::Max($image.Width, $image.Height) -gt $MaxSize
      if ($rotated -or $tooBig) {
        $size = Save-Scaled $image $photo.FullName $MaxSize $isPng
        Write-Output "RESIZED $($dir.Name)/$($photo.Name) -> $size"
        $resized++
        $photo.Refresh()
      }

      $thumbPath = Join-Path $thumbDir ([IO.Path]::GetFileNameWithoutExtension($photo.Name) + '.jpg')
      $thumbFile = Get-Item -LiteralPath $thumbPath -ErrorAction SilentlyContinue
      if (-not $thumbFile -or $thumbFile.LastWriteTime -lt $photo.LastWriteTime) {
        if (-not (Test-Path $thumbDir)) { New-Item -ItemType Directory -Path $thumbDir | Out-Null }
        $size = Save-Scaled $image $thumbPath $ThumbSize $false
        Write-Output "THUMB $($dir.Name)/thumbs/$([IO.Path]::GetFileName($thumbPath)) -> $size"
        $thumbs++
      }
    } finally {
      $image.Dispose()
    }
  }

  # Мініатюри без оригіналу (фото видалили або перейменували)
  if (Test-Path $thumbDir) {
    $names = $photos | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_.Name) }
    foreach ($thumb in Get-ChildItem -Path $thumbDir -File) {
      if ($names -notcontains [IO.Path]::GetFileNameWithoutExtension($thumb.Name)) {
        Remove-Item $thumb.FullName
        Write-Output "REMOVED $($dir.Name)/thumbs/$($thumb.Name)"
        $removed++
      }
    }
    if (-not (Get-ChildItem -Path $thumbDir)) { Remove-Item $thumbDir }
  }
}

Write-Output "DONE resized=$resized thumbs=$thumbs removed=$removed"
