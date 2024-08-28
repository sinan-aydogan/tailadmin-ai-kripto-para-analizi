import getBtcWallet from "./exchange_services/btc_turk.js";
import { runPrompt } from "./ai_services/gemini.js";
import fs from "fs";
import ExcelJS from 'exceljs';
import moment from 'moment';

const pairs = ["BTCUSDT",
    "AAVEUSDT",
    "ACMUSDT",
    "ADAUSDT",
    "AFCUSDT",
    "AGIXUSDT",
    "AIOZUSDT",
    "ALGOUSDT",
    "AMPUSDT",
    "ANKRUSDT",
    "ANTUSDT",
    "APEUSDT",
    "API3USDT",
    "APTUSDT",
    "ARBUSDT",
    "ARPAUSDT",
    "ASRUSDT",
    "ATMUSDT",
    "ATOMUSDT",
    "AUDIOUSDT",
    "AVAXUSDT",
    "AXSUSDT",
    "BANDUSDT",
    "BARUSDT",
    "BATUSDT",
    "BLURUSDT",
    "BNTUSDT",
    "BONKUSDT",
    "CHZUSDT",
    "CITYUSDT",
    "COMPUSDT",
    "CRVUSDT",
    "CTSIUSDT",
    "CVCUSDT",
    "DASHUSDT",
    "DOGEUSDT",
    "DOTUSDT",
    "ENJUSDT",
    "ENSUSDT",
    "EOSUSDT",
    "ETCUSDT",
    "ETHUSDT",
    "ETHWUSDT",
    "FBUSDT",
    "FETUSDT",
    "FILUSDT",
    "FLOKIUSDT",
    "FLOWUSDT",
    "FLRUSDT",
    "FTMUSDT",
    "GALAUSDT",
    "GALUSDT",
    "GLMUSDT",
    "GRTUSDT",
    "HBARUSDT",
    "HOTUSDT",
    "IMXUSDT",
    "INJUSDT",
    "INTERUSDT",
    "JASMYUSDT",
    "JUPUSDT",
    "JUVUSDT",
    "KSMUSDT",
    "LDOUSDT",
    "LINKUSDT",
    "LPTUSDT",
    "LRCUSDT",
    "LTCUSDT",
    "LUNAUSDT",
    "MAGICUSDT",
    "MANAUSDT",
    "MASKUSDT",
    "MATICUSDT",
    "MKRUSDT",
    "NAPUSDT",
    "NEARUSDT",
    "NEOUSDT",
    "NMRUSDT",
    "OCEANUSDT",
    "OGNUSDT",
    "OMGUSDT",
    "PAXGUSDT",
    "PEPEUSDT",
    "PSGUSDT",
    "PYTHUSDT",
    "QNTUSDT",
    "RADUSDT",
    "RLCUSDT",
    "RNDRUSDT",
    "SANDUSDT",
    "SHIBUSDT",
    "SKLUSDT",
    "SNXUSDT",
    "SOLUSDT",
    "SPELLUSDT",
    "STORJUSDT",
    "STRKUSDT",
    "STXUSDT",
    "SUPERUSDT",
    "SUSHIUSDT",
    "TIAUSDT",
    "TONUSDT",
    "TRAUSDT",
    "TRXUSDT",
    "TUSDT",
    "UMAUSDT",
    "UNIUSDT",
    "USDCUSDT",
    "WIFUSDT",
    "XCNUSDT",
    "XLMUSDT",
    "XRPUSDT",
    "XTZUSDT",
    "ZRXUSDT"]

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
        { header: 'Pair', key: 'pair', width: 10 },
        { header: 'Price', key: 'price', width: 15 }
    ];

    Object.entries(data).forEach(([pair, price]) => {
        sheet.addRow({ pair, price });
    });

    await workbook.xlsx.writeFile('current_prices_of_pairs.xlsx');
    console.log('Güncel coin fiyatları excel dosyası oluşturuldu');
}

const pairs_kline_data = async () => {
    let list = {};
    let now = new Date();
    let from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let to = now;
    let unixTimestamp = (time) => Math.floor(time.getTime() / 1000);
    let endPoint = (p) => `https://graph-api.btcturk.com/v1/klines/history?from=${unixTimestamp(from)}&resolution=30&symbol=${p}&to=${unixTimestamp(to)}`;
    let hasError = false;
    let checkTotalRequestErrors = [];

    for (let i = 0; i < pairs.length && !hasError; i++) {
        await fetch(endPoint(pairs[i]))
            .then(res => res.json())
            .then(data => {
                if (data.s && data.s === 'ok') {
                    hasError ? hasError = false : null;

                    list[pairs[i]] = data;
                } else {
                    hasError = true;
                    checkTotalRequestErrors.push({ pair: pairs[i], message: data.message });

                    console.log(`Kline data alma hatası: ${data.message}`);
                }
            });
    }

    if (checkTotalRequestErrors.length === 0) {
        console.log('Kline data alındı');
        create_kline_data_excel_file(list);
    }

    return list;
}


const create_kline_data_excel_file = async (data)=> {
    const workbook = new ExcelJS.Workbook();
    for (let [symbol, symbolData] of Object.entries(data)) {
        const sheet = workbook.addWorksheet(symbol);
        sheet.columns = [
            { header: 'Timestamp', key: 't', width: 20 },
            { header: 'High', key: 'h', width: 10 },
            { header: 'Open', key: 'o', width: 10 },
            { header: 'Low', key: 'l', width: 10 },
            { header: 'Close', key: 'c', width: 10 },
            { header: 'Volume', key: 'v', width: 15 }
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

    await workbook.xlsx.writeFile('kline_data.xlsx');
    console.log('Kline data excel dosyası oluşturuldu');
}

const generatePrompt = (wallet, currentPricesOfPairs, pairsKlineData) => `
Rolün: Sen kripto para (coin) konusunda uzman bir yatırım danışmanısın. Teknik analizlerde derinlemesine uzmanlığa sahipsin ve aynı zamanda temel analiz yaparak piyasa haberlerinin teknik analizlere etkisini değerlendirebiliyorsun. Kripto para borsalarındaki hareketleri analiz edebiliyor, verileri yorumluyor ve sağlam öngörülerde bulunuyorsun.

Yorumlarının kapsamı: Yalnızca kripto paralar konusunda değerlendirme yapmalısın. Teknik analizlerin nasıl yapılacağı konusunda açıklamada bulunma. Teknik analiz sonuçlarını tablo halinde yazdır ve teknik yorumunu kısa, net ve kanıta dayalı olarak yap. Sorumluluk reddi beyanında bulun ve yorumunun en alt kısmına "YATIRIM TAVSİYESİ DEĞİLDİR" uyarısı ekle, sadece teknik verilere dayalı yorum yap. Verilerde tutarsızlık tespit ettiğinde analizi yinede gerçekleştir fakat kesin bir dil veri setindeki hata hakkında sebebiyle birlikte uyarıda bulun.

Yorum stili: Her zaman rakamsal değerlerin birimini yanında yazdır. Cümlelerini kısa tut. Değeri ani düşüş yaşayabilecek coin olduğunda ciddi bir üslup takın. Yatırım fırsatı olduğunda, teknik analiz kapsamını genişlet ve kullanıcının heyecanlanarak yanlış yatırım yapmasını önleyecek resmi bir dil kullan.  Ayrıca, risk yönetimi için önerilerde bulun.

Kurallar: Kod blokları yazdırma. Kodların nasıl çalıştığını anlatma. Teknik analizleri gerçekleştirirken hangi metodu kullandığını, teknik sonucu ve yorumunu tablo ile paylaş ve ilgili coin için teknik analiz verisini güçlü al, al, uzun vadede tut, kısa vadede tut, sat, güçlü sat gibi derecelendirerek sonuç belirt.

Hedefler: Kripto para yatırımcısının portföyünün değer kaybını önlemek, muhtemel kazanç fırsatlarını tespit ederek porföyün değer artışını sağlamak. Teknik ve temel analiz yaparak, alınacak kararları bilimsel olarak temellendirerek yatırımcısının sağlıklı kararlar almasını sağlamak.

Kullanıcıdan gelecek veriler: Kullanıcının portföyünde olan coinlerin ismi ve adedi. Kullanıcının yatırım yaptığı kripto para borsasının sağladığı işlem gören coinlerin listesi. Borsada işlem gören her bir coin'e ait 7 günlük 5 dakikada bir alınmış kline data (t: zaman damgası, h: en yüksek değer, o:açılış değeri, l:en düşük değer, c:kapanış değeri, v:işlem hacmi) değerleri, her bir veri zaman damgası ile aynı index'e (sıraya) sahiptir.

Senin bulacağın veriler: Teknik analiz yapaken aynı zamanda https://cryptonews.com/wp-json/wp/v2/posts/, https://cointelegraph.com/rss/tag/altcoin, https://cointelegraph.com/rss/tag/regulation, https://finance.yahoo.com/topic/crypto/ kaynaklarındaki son 10 haberi oku ve haberin konusunu anlamaya çalış ve teknik analize etkisini değerlendir. Ayrıca, piyasadaki genel duyarlılığı ve haberlerin etkisini temel analiz kapsamında değerlendir.

----

Analizin Bölümleri:

Ön Hazırlık(Temel analiz için veri toplama): Kripto para haberlerini oku ve haberin konusunu anlamaya çalış ve sonraki adımlarda hem borsada işlem gören coinleri değerlendirirken hemde portföydeki coinleri değerlendirirken teknik analize etkisini değerlendir. Temel analiz kapsamında bu haberlerin fiyat hareketleri üzerindeki olası etkilerini de göz önünde bulundur.

1.Bölüm (Portföy Analizi): Portföydeki Coinlerin Güncel Değerlerini ve Borsada işlem gören coinlerin listesini kullanarak porföydeki coinler için ayrıca teknik analiz yap. Portföyün toplam değerinide tabloda göster. Coinlerin yükseliş trendinde olup olmadığını belirle. Coinlerin yükseliş trendinde olup olmadığını belirlerken son 7 günlük değerlerine bak. Portföydeki coinlerin 1 gün, 3 gün ve 7 gün sonraki değerlerini ön görmeye çalış. Hızlı değer kaybı potansiyeline karşı kullanıcıyı uyar. Sonuçları tablo halinde yazdır ve risk yönetimi için uygun stratejiler öner. 

2.Bölüm (Piyasa Analizi): Borsada işlem gören coinlerin 7 günlük 5 dakikada bir alınmış kline datasına teknik analiz yap. RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), Fibonacci retracement, TRIX analizi, Bollinger Bandı, Ichimoku Clouds, ve Parabolic SAR indikatörlerini kullanarak derinlemesine analiz yap. Güçlü  yükseliş trendinde olan coinlerden başlayarak tabloyu sıralandır, en altta ise güçlü düşüş trendinde olan coinleri sırala. Sonuçları tablo halinde yazdır. Coinlerin %60'ı düşüş trendinde olduğunda özel bir başlıkta uyarı ver. Coinlerin %60'ı yükseliş trendinde olduğunda özel bir başlıkta öneri ver. 

3.Bölüm (Piyasa fırsatları ve risklerinin değerlendirilmesi): Kullanıcının portföyünde bulunmayan ve projesi sağlam olan 5 adet yükseliş trendinde olan coin öner. Bu coinlerin teknik analiz tablolarını yazdır ve temel analiz kapsamında projelerinin gücünü değerlendir. Potansiyel kazanç miktarını yüzdesel olarak göster. Yükseliş trendinin kısa sürede mi, uzun vadede mi devam edeceğini detaylandır. Ayrıca, bu önerilerde risk yönetimi stratejileri sun.


Analizler için kullanılacak veriler:

Portföydeki coinler (coin: toplam adet): ${JSON.stringify(wallet)}

Portföydeki Coinlerin Güncel Değerleri (coin: 1 adetin USDT cinsinden değeri): ${JSON.stringify(currentPricesOfPairs)}

Borsada işlem gören coinlerin listesi: ${JSON.stringify(pairs)}

Borsada işlem gören coinlerin 7 günlüklük 5 dakikada bir alınmış kline datası: ${JSON.stringify(pairsKlineData)}

`

const getAllData = async () => {
    Promise.all([getBtcWallet(), current_prices_of_pairs(), pairs_kline_data()])
        .then(async (data) => {
            let prompt = generatePrompt(data[0], data[1], data[2]);

            try {
                fs.writeFileSync('prompt.txt', prompt);
                console.log('Propmt metnini dosyaya yazma işlemi başarılı!, propmt.txt dosyasını kontrol edin.');
            } catch (err) {
                console.error('Dosyaya yazma hatası:', err);
            }

            await runPrompt(prompt);
        });
}

getAllData();

