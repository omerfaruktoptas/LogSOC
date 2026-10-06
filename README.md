# LogSOC - Siber Güvenlik Log Analizi ve Gösterge Paneli

![LogSOC Dashboard](https://img.shields.io/badge/Security-SOC-blue) ![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow) ![Status](https://img.shields.io/badge/Status-Active-success)

LogSOC, güvenlik analistlerinin (SOC Analistleri) sistem ve web sunucusu loglarını (SSH, Apache, Nginx vb.) hızlıca analiz etmesini, siber tehditleri tespit etmesini ve bu verileri görselleştirmesini sağlayan tamamen istemci tarafında (Client-Side) çalışan bir web arayüzüdür.

## 🚀 Özellikler

- **Kural Tabanlı Tehdit Tespiti:** Ham log dosyalarını ayrıştırarak Brute-Force, SQL Injection, XSS ve Port Tarama gibi saldırıları otomatik olarak tespit eder.
- **Olay Müdahale (Incident Response) Odaklı:** Yüz binlerce satırlık karmaşık logları analiz ederek saniyeler içinde kritik tehditleri ayıklar.
- **Dinamik Trafik Analizi:** Yüklenen logların tarihlerine göre haftalık trafik yoğunluğunu görsel grafiklerle sunar.
- **İnsan Okunabilir Raporlama (Günün Özeti):** Karmaşık log verilerini teknik olmayan ekiplerin veya yöneticilerin anlayabileceği özet metinlere dönüştürür.
- **Tamamen Çevrimdışı (Offline) Çalışma:** Hiçbir veri sunucuya gönderilmez. Tüm analiz işlemleri tarayıcı (JavaScript) üzerinde yerel olarak gerçekleşir.

## 🛠️ Kurulum ve Kullanım

Herhangi bir veritabanı veya sunucu kurulumuna gerek yoktur. 

1. Bu projeyi bilgisayarınıza indirin (Clone).
2. `index.html` dosyasını favori tarayıcınızda açın.
3. Sol menüden **Belgeler (Log Yükle)** sekmesine tıklayarak bilgisayarınızdaki log dosyalarını sisteme yükleyin.
4. **Takvim** sekmesine geçerek logların analiz sonuçlarını ve detaylarını inceleyin.

*(İsteğe bağlı olarak Python ile hızlı bir sunucu başlatabilirsiniz: `python3 -m http.server 8080`)*

## 🧪 Örnek Test Senaryoları (Nasıl Test Edebilirsiniz?)

Sistemin siber saldırıları nasıl yakaladığını test etmek için aşağıdaki senaryoları uygulayabilirsiniz:

### Senaryo 1: SSH Brute-Force (Kaba Kuvvet) Tespiti
1. Linux makinenizdeki `/var/log/auth.log` dosyasını (veya `journalctl -u ssh > ssh.log` çıktısını) sisteme yükleyin.
2. Sistem, "Failed password", "Invalid user" gibi anahtar kelimeleri yakalayarak IP adreslerini ve saldırı sıklığını **Orta/Kritik Tehdit** olarak işaretleyecektir.

### Senaryo 2: Web Zafiyet Taraması Tespiti
1. Web sunucunuzun erişim loglarını (örneğin Apache `/var/log/apache2/access.log`) sisteme yükleyin.
2. Logların içerisinde geçen `Nmap`, `Nikto`, veya URL parametrelerindeki `OR '1'='1'`, `<script>` gibi SQLi/XSS denemeleri sistem tarafından anında filtrelenecek ve detaylı olarak listelenecektir.

## 👨‍💻 Geliştirici
**Ömer Faruk TOPTAŞ** - Siber Güvenlik
- [LinkedIn](https://www.linkedin.com/in/omer-faruk-toptas-43b599374/)
- [GitHub](https://github.com/omerfaruktoptas)

---
*Not: Bu proje Siber Güvenlik / SOC (Security Operations Center) alanındaki tehdit avcılığı yeteneklerini göstermek amacıyla geliştirilmiştir.*
