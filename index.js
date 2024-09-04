import getWallet from "./exchange_services/btc_turk.js";
import {runPrompt} from "./ai_services/gemini.js";
import fs from "fs";
import ExcelJS from 'exceljs';
import moment from 'moment';
import convertExcelToPDF from "./pdfGenerator.js";

const pairs = [
    "BTCUSDT",
    "AAVEUSDT",
    "ADAUSDT",
    "ALGOUSDT",
    "ATOMUSDT",
    "AVAXUSDT",
    "AXSUSDT",
    "COMPUSDT",
    "CRVUSDT",
    "DASHUSDT",
    "DOGEUSDT",
    "DOTUSDT",
    "ENJUSDT",
    "ENSUSDT",
    "EOSUSDT",
    "ETCUSDT",
    "ETHUSDT",
    "FILUSDT",
    "FTMUSDT",
    "GALAUSDT",
    "LINKUSDT",
    "LTCUSDT",
    "MANAUSDT",
    "MATICUSDT",
    "MKRUSDT",
    "NEARUSDT",
    "NEOUSDT",
    "OCEANUSDT",
    "PAXGUSDT",
    "QNTUSDT",
    "RENDERUSDT",
    "SANDUSDT",
    "SOLUSDT",
    "SNXUSDT",
    "SUSHIUSDT",
    "TONUSDT",
    "TRXUSDT",
    "UNIUSDT",
    "XLMUSDT",
    "XRPUSDT",
    "XTZUSDT",
]

const current_prices_of_pairs = async () => {
    let list = {};
    let endPoint = 'https://api.btcturk.com/api/v2/ticker/currency?symbol=USDT';
    await fetch(endPoint)
        .then(res => res.json())
        .then(data => {
            data.data.forEach(coin => {
                list[coin.pair] = coin.last;
            });

            console.log('Güncel coin fiyatları alındı');
            create_current_prices_of_pairs_excel(list);
        });

    return list;
}

const create_current_prices_of_pairs_excel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Current Prices');

    sheet.columns = [
        {header: 'Pair', key: 'pair', width: 10},
        {header: 'Price', key: 'price', width: 15}
    ];

    Object.entries(data).forEach(([pair, price]) => {
        sheet.addRow({pair, price});
    });

    await workbook.xlsx.writeFile('generated_files/current_prices_of_pairs.xlsx');

    console.log('Güncel coin fiyatları excel dosyası oluşturuldu');
}

const pairs_kline_data = async () => {
    let list = {};
    let now = new Date();
    let from = new Date(now.getTime() - Number(process.env.KLINE_RANGE_DAY) * 24 * 60 * 60 * 1000);
    let to = now;
    let unixTimestamp = (time) => Math.floor(time.getTime() / 1000);
    let endPoint = (p) => `https://graph-api.btcturk.com/v1/klines/history?from=${unixTimestamp(from)}&resolution=${Number(process.env.KLINE_RESOLUTION)}&symbol=${p}&to=${unixTimestamp(to)}`;
    let hasError = false;
    let checkTotalRequestErrors = [];

    for (let i = 0; i < pairs.length && !hasError; i++) {
        await fetch(endPoint(pairs[i]))
            .then(res => res.json())
            .then(data => {
                if (!data.message) {
                    hasError ? hasError = false : null;

                    if (data.s !== null) {
                        list[pairs[i]] = data;
                    } else {
                        console.log('Tanımsız coin çifti: ', pairs[i]);
                    }
                } else {
                    hasError = true;
                    checkTotalRequestErrors.push({pair: pairs[i], message: data.message});

                    console.log(`Kline data alma hatası: ${JSON.stringify(data)}`);
                }
            });
    }

    if (checkTotalRequestErrors.length === 0) {
        console.log('Kline data alındı');
        await create_kline_data_excel_file(list);
    }

    return list;
}


const create_kline_data_excel_file = async (data) => {
    const workbook = new ExcelJS.Workbook();
    for (let [symbol, symbolData] of Object.entries(data)) {
        const sheet = workbook.addWorksheet(symbol);
        sheet.columns = [
            {header: 'Timestamp', key: 't', width: 20},
            {header: 'High', key: 'h', width: 10},
            {header: 'Open', key: 'o', width: 10},
            {header: 'Low', key: 'l', width: 10},
            {header: 'Close', key: 'c', width: 10},
            {header: 'Volume', key: 'v', width: 15}
        ];

        symbolData.t.forEach((time, index) => {
            sheet.addRow({
                t: moment.unix(time).format('YYYY-MM-DD HH:mm:ss'),
                h: symbolData.h[index],
                o: symbolData.o[index],
                l: symbolData.l[index],
                c: symbolData.c[index],
                v: symbolData.v[index]
            });
        });
    }

    await workbook.xlsx.writeFile('generated_files/kline_data.xlsx');
    console.log('Kline data excel dosyası oluşturuldu');
}

const prompt = `
Aşağıdaki metin bu süreç boyunca uygulaman gereken adımları ve yapman gereken analizleri içerir. Bu metni dikkatlice oku ve adımları sırasıyla uygula. Bu adımı tamamladıktan sonra analiz yapmaya hazır olacaksın. Bu adımları geri bildirim olarak ekrana yazdırma.

Rolün: Sen kripto para (coin) konusunda uzman bir yatırım danışmanısın. Teknik analizlerde derinlemesine uzmanlığa sahipsin ve aynı zamanda temel analiz yaparak piyasa haberlerinin teknik analizlere etkisini değerlendirebiliyorsun. Kripto para borsalarındaki hareketleri analiz edebiliyor, verileri yorumluyor ve sağlam öngörülerde bulunuyorsun. Kripto para piyasasında ayı ve boğa dönemlerini analiz edebiliyor ve yatırımcına doğru kararlar almasında yardımcı oluyorsun. Ayrıca, risk yönetimi konusunda bilgi sahibisin ve yatırımcına risklerini minimize etme konusunda stratejiler sunuyorsun.

Yorumlarının kapsamı: Yalnızca kripto paralar konusunda değerlendirme yapmalısın. Teknik analiz sonuçlarını tablo halinde yazdır ve teknik yorumunu kısa, net ve kanıta dayalı olarak yap. Sorumluluk reddi beyanında bulun ve yorumunun en alt kısmına "YATIRIM TAVSİYESİ DEĞİLDİR" uyarısı ekle. Yorumlarında sadece teknik verilere dayalı analiz yap. Verilerde tutarsızlık tespit ettiğinde analizi yine de gerçekleştir, ancak kesin bir dil kullanmadan veri setindeki hatayı ve sebebini açıkça belirt.

Yorum stili: Her zaman rakamsal değerlerin birimini yanında yazdır. Cümlelerini kısa tut. Değeri ani düşüş yaşayabilecek coin olduğunda ciddi bir üslup takın. Yatırım fırsatı olduğunda, teknik analiz kapsamını genişlet ve kullanıcının heyecanlanarak yanlış yatırım yapmasını önleyecek resmi bir dil kullan.  Ayrıca, risk yönetimi için önerilerde bulun.

Kurallar: Kod blokları yazdırma. Kodların nasıl çalıştığını anlatma. Teknik analizleri gerçekleştirirken hangi metodu kullandığını, teknik sonucu ve yorumunu tablo ile paylaş ve ilgili coin için teknik analiz verisini güçlü al, al, uzun vadede tut, kısa vadede tut, sat, güçlü sat gibi derecelendirerek sonuç belirt.

Hedefler: Kripto para yatırımcısının portföyünün değer kaybını önlemek, muhtemel kazanç fırsatlarını tespit ederek porföyün değer artışını sağlamak. Teknik ve temel analiz yaparak, alınacak kararları bilimsel olarak temellendirerek yatırımcısının sağlıklı kararlar almasını sağlamak.

Analizin Bölümleri:

1. Temel Analiz: https://cryptonews.com/wp-json/wp/v2/posts/, https://cointelegraph.com/rss/tag/altcoin, https://cointelegraph.com/rss/tag/regulation, https://finance.yahoo.com/topic/crypto/ haber sitelerindeki son 10 haberi oku ve haberin konusunu anlamaya çalış ve teknik analize etkisini değerlendir. Ayrıca, piyasadaki genel duyarlılığı ve haberlerin etkisini temel analiz kapsamında değerlendir. Temel analiz kapsamında bu haberlerin fiyat hareketleri üzerindeki olası etkilerini de göz önünde bulundur. Kullanıcıya Göstereceğin Çıktıda olması gerekenler: Temel analiz sonuçlarını tablo halinde yazdır ve yorumunu kısa, net ve kanıta dayalı olarak yap. Piyasada ani değer dalgalanması yaratabilecek, regülasyon, hacklenme, dolandırıcılık gibi risklerin olup olmadığını belirle. Yatırımcıyı bu riskler konusunda uyar.

2. Portföy Analizi:  btc_turk_wallet.pdf", "current_prices_of_pairs.pdf" ve kline_data.pdf dosyalarındaki verileri kullan, btc_turk_wallet.pdf dosyasında yer alan coinlerin güncel değerini current_prices_of_pairs.pdf dosyasında yer alan verileri kullanarak hesapla ve toplam portföy değeri ile birlikte bir tablo halinde yazdır. kline_data.pdf dosyasında yer alan verileri kullanarak btc_turk_wallet.pdf dosyasında yer alan coinler için RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), Fibonacci retracement, TRIX analizi, Bollinger Bandı, Ichimoku Clouds, ve Parabolic SAR indikatörlerini kullanarak derinlemesine teknik analiz yap. Coinlerin yükseliş trendinde olup olmadığını belirle. Portföydeki coinlerin 1 gün, 3 gün ve 7 gün sonraki değerlerini ön görmeye çalış. Portföyün Son 3 günlük kar/zarar analizini yap. Portföydeki teknik analiz sonuçlarını tablo halinde yazdır. Coinlerin yükseliş trendinde olup olmadığını belirle. Coinlerin 1 gün, 3 gün ve 7 gün sonraki değerlerini tahmin et. Tahminlerini tablo halinde yazdır. Hızlı değer kaybı potansiyeline karşı kullanıcıyı uyar. Teknik analiz sonucunu kısa vadede kazanç, uzun vadade kazanç, yüksek değer kaybı riski, güçlü kazanç fırsatı gibi özet sonucu içerecek şekilde tablo haline getir. Ayrıca portföyün risk analizini yap ve yönetimi için uygun stratejiler öner. 

3. Piyasa Analizi: kline_data.pdf verisini kullanarak her sayfa bir coin'e ait kline data içeren kline_data.pdf dosyası içindeki coinler içinden projesi olan, bir topluluk veya kurum veya kuruluş tarafından desteklenen, kendine ait gelir kaynağı olan coinleri tespit et, analiz edilecek coin sayısı 15 adeti geçmesin ve o coinlerin verilerini kullanarak RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), Fibonacci retracement, TRIX analizi, Bollinger Bandı, Ichimoku Clouds, ve Parabolic SAR indikatörlerini kullanarak derinlemesine teknik analiz yap. Analiz sonuçlarını bir tablo haline getir. Analiz sonuçlarını alım veya satım konusunda ön görünü çok kısa bir terim ile belirt (güçlü al, elde tut, güçlü sat, yüksek değer kaybı vb.). Güçlü  yükseliş trendinde olan coinlerden başlayarak tabloyu sıralandır, en altta ise güçlü düşüş trendinde olan coinleri sırala. 1-3 ve 7 gün sonraki tahmini değerlerini ekle. Sonuçları tablo halinde yazdır. Coinlerin %60'ı düşüş trendinde olduğunda özel bir başlıkta uyarı ver. Coinlerin %60'ı yükseliş trendinde olduğunda özel bir başlıkta öneri ver. 
 
 Sana verilen uygulama komutları bitti. Şimdi analiz yapmaya hazırsın. Tüm çıktını Markdown formatı ile tam uyumlu şekilde hazırla. İyi çalışmalar!
`

const getAllData = async () => {
    Promise.all([getWallet(), current_prices_of_pairs(), pairs_kline_data()])
        .then(async () => {

            try {
                fs.writeFileSync('generated_files/prompt.txt', prompt);
                console.log('Propmt metnini dosyaya yazma işlemi başarılı!, propmt.txt dosyasını kontrol edin.');
            } catch (err) {
                console.error('Dosyaya yazma hatası:', err);
            }

            if (process.env.GENERATE_ONLY_EXCEL !== 'true') {

                await Promise.all([
                    convertExcelToPDF('generated_files/btc_turk_wallet.xlsx', 'generated_files/btc_turk_wallet.pdf'),
                    convertExcelToPDF('generated_files/kline_data.xlsx', 'generated_files/kline_data.pdf'),
                    convertExcelToPDF('generated_files/current_prices_of_pairs.xlsx', 'generated_files/current_prices_of_pairs.pdf')
                ]).then(async () => {
                    console.log('Excel dosyaları pdf dosyalarına dönüştürüldü ve prompt metni hazırlandı. Şimdi analiz yapmaya hazırsınız.');

                    await runPrompt(prompt);

                });
            }
        });
}

getAllData();

