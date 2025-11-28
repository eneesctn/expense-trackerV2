# Mini Harcama Takip Uygulaması

Bu proje, kişisel harcamaları basit ve hızlı bir şekilde takip etmek için geliştirilmiş küçük bir uygulamadır. Amacı; günlük hayatta yapılan ufak harcamaları unutmamak, ay boyunca toplam gideri görmek ve düzenli takip alışkanlığı oluşturmaktır.

Uygulamanın arayüzü mümkün olduğunca sade tutuldu. Harcama girişi, listeleme ve toplam tutar gibi temel fonksiyonlar hızlıca kullanılabiliyor.

## Özellikler

- Harcama ekleme (tutar, açıklama)
- Aylık toplam harcamayı otomatik hesaplama
- Eklenen harcamaları liste halinde gösterme
- Kullanıcı girişi (register/login)
- Ay sonu için “sıfırlama” özelliği
- Backend üzerinde basit JSON tabanlı veri saklama

## Kullanılan Teknolojiler

**Frontend:**  
HTML, CSS, Vanilla JavaScript

**Backend:**  
Node.js, Express.js  
JWT ile doğrulama, bcrypt ile şifreleme  
JSON tabanlı küçük bir veri deposu

## Kurulum

### 1. Projeyi klonla
git clone https://github.com/eneesctn/expense-trackerV2.git

### 2. Backend’i çalıştır
cd backend  
npm install  
node server.js

Sunucu: http://localhost:3000

### 3. Arayüzü aç
index.html dosyasını tarayıcıda açman yeterli.  
(VS Code Live Server kullanıyorsan otomatik çalışır.)

## Notlar

Bu proje temel bir harcama takip uygulaması olarak tasarlandı.  
Zamanla eklenebilecek fikirler: kategori sistemi, grafikler, veri dışa aktarma, tema desteği vs.
