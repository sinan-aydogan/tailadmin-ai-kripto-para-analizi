# TailAdmin - AI Kripto Para Analizi (YTD)

AI Kripto, kripto para birimleriyle ilgili işlemleri gerçekleştirmek için kullanılan bir yazılım projesidir. Bu proje, şimdilik BTC Türk api servisleri ile çalışmaktadır ve yorumlayıcı olarak Gemini Ai  hizmetini kullanmaktadır. 

# Yasal Uyarı

Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir. Yatırım danışmanlığı hizmeti, aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım danışmanlığı sözleşmesi çerçevesinde sunulmaktadır. Burada yer alan yorum ve tavsiyeler, yorum ve tavsiyede bulunan yapak zeka modelinin veri setine dayanmaktadır. Bu görüşler, mali durumunuz ile risk ve getiri tercihlerinize uygun olmayabilir. Bu nedenle, sadece burada yer alan bilgilere dayanılarak yatırım kararı verilmesi, beklentilerinize uygun sonuçlar doğurmayabilir.

Uygulamanın ürettiği prompt verisi farklı yapay zekalar tarafından farklı şekilde yorumlanabilir. Üretilen analizi doğrulamak kullanıcının sorumluluğundadır.

Ulaşmış veya kullanmış olduğunuz bu uygulama kapsamındaki gerek sözel gerekse de teknik bilgiler ulaşılabilen ilk kaynaklardan, kripto para alış satım borsalarından, yapay zeka çıktılarından ve veri setlerinden iyi niyetle ve doğruluğu, geçerliliği, etkinliği velhasıl her ne şekil ve surette olursa olsun herhangi bir karar dayanak oluşturması hususunda herhangi bir teminat, garanti oluşturmadan yalnızca bilgi edinilmesi amacıyla toplanmıştır. Uygulamanın yazılım ekibi her an hiçbir şekil ve surette ön ihbara ve/veya ihtara gerek kalmaksızın söz konusu bilgileri değiştirebilir ve/veya ortadan kaldırabilir. Genel anlamda bilgi vermek amacıyla hazırlanmış olan işbu uygulama kapsamı bilgiler hiçbir şekil ve surette uygulamanın geliştiricilerini herhangi bir taahhüdünü tazammun etmediğinden, bu bilgilere istinaden her türlü özel ve/veya tüzel kişiler tarafından alınacak kararlar, varılacak sonuçlar ve oluşabilecek her türlü riskler bizatihi bu kişilere ait olacaktır. Hiçbir şekil ve surette ve her ne nam altında olursa olsun, her türlü gerçek ve/veya tüzel kişinin gerek doğrudan gerek dolayısı ile uğrayacağı maddi ve/veya manevi zararı, kâr mahrumiyeti, velhasıl her ne nam altında olursa olsun uğrayabileceği zararlardan hiçbir şekil ve surette uygulama geliştiricileri, yapak zeka servis sağlayıcıları ve teknik analiz veri sağlayıcıları (Kripto Para Haber Siteleri, Kripto Para Borsaları) sorumlu tutulamayacaktır.

İş bu uyarı neticesinde bu uygulamayı ve çıktılarını kullanan her kullanıcı bu sorumluluk reddi beyanını kabul etmiş ve yaşayacağız her türlü zarar, yaptırım veya diğer etkilerin sorumluluğunu kullanıcı üstlenmiş olacaktır.

Piyasa verileri kripto para borsalarının sağladığı halka açık api servisleri tarafından sağlanmaktadır. Kline Data verisi son 7 günlük 30 dakikada bir alınmış örnekleme olarak kripto para borsalarının halka açık api servisleri tarafından sağlanır.

## Özellikler

- Portföy analizi (kullanıcı kontrolünde ve sorumluluğunda)
- API entegrasyonu

## Kurulum

1. Projenin kaynak kodlarını indirin veya kopyalayın.
2. Gerekli bağımlılıkları yüklemek için `npm install` komutunu çalıştırın.
3. `.env.example` dosyasının ismini `.env` olarak değiştirin ve ilgili api servisleri için temin ettiğini api anahtarını girin.
4. Uygulamayı başlatmak için `npm run analiz` komutunu çalıştırın.
5. Uygulama girdiğiniz veriler ile kripto para borsalarından çektiği veriler ile analizini tamamladığında  `generated_files` klasörü altında `.xlsx` ve `.pdf` formatında veri dosyaları oluşturacaktır. Bu dosyaları kullanarak farklı dil modellerinde verileri analiz ettirebilirsiniz. Varsayılan analiz raporunuz `result.md` dosyasıdır. Her analiz yaptırdığınızda bu dosyalar yeniden oluşturulur.
6. Bu uygulamanın dışında, bu uygulamanın ürettiği prompt metnini kullanırken halla başlıkta yer alan "Yasal Uyarı" metninin geçerliliği devam edecektir. Alacağınız tüm kararlar, portföyünüz zarara uğraması veya yasal kural uygulayıcılar tarafından yaptırım uygulanmasının tüm sorumluluğu kullanıya ait olacaktır.

## Katkıda Bulunma

1. Bu projeyi forklayın.
2. Yeni bir branch oluşturun: `git checkout -b yeni-ozellik`
3. Değişikliklerinizi yapın ve commit edin: `git commit -am 'Yeni özellik ekle'`
4. Branch'inizi push edin: `git push origin yeni-ozellik`
5. Pull request oluşturun.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasını inceleyin.
