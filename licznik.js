const express = require('express');
const { createCanvas, registerFont  } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
const path = require('path');

dayjs.extend(duration);

const app = express();
const PORT = 3002;

app.get("/countdown.gif", (req, res) => {
  // Pobierz datę z parametru URL
  const targetDateStr = req.query.date;
  
  if (!targetDateStr) {
    return res.status(400).send('Musisz podać datę w parametrze URL, np. ?date=2025-04-10T12:00:00');
  }

  const targetDate = dayjs(targetDateStr);
  
  if (!targetDate.isValid()) {
    return res.status(400).send('Niepoprawny format daty.');
  }

  // GIF Encoder
  const encoder = new GIFEncoder(650, 150);
  const canvas = createCanvas(6500, 2000);
  const ctx = canvas.getContext('2d');

  // Nagłówki odpowiedzi
  res.set({
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });

  encoder.createReadStream().pipe(res);
  encoder.start();
  encoder.setRepeat(0); // Bez powtórzeń
  encoder.setDelay(1000); // 1 sekunda na każdą klatkę
  encoder.setQuality(10); // Jakość GIF-a

  const updateCountdown = () => {
    const now = dayjs();
    const diff = targetDate.diff(now);

    // Jeśli czas minął
    if (diff <= 0) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 650, 150);
      ctx.fillStyle = 'black';
      ctx.font = 'bold 70px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CZAS MINĄŁ', 325, 75);
      encoder.addFrame(ctx);
      encoder.finish();
      return; // Zakończ generowanie GIF-a
    }

    const d = dayjs.duration(diff);
    const days = String(Math.floor(d.asDays())).padStart(2, '0');
    const hours = String(d.hours()).padStart(2, '0');
    const minutes = String(d.minutes()).padStart(2, '0');
    const seconds = String(d.seconds()).padStart(2, '0');
    const timeText = `${days} : ${hours} : ${minutes} : ${seconds}`;

    // Wypełnienie tła
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 650, 150);

    // Wypisanie czasu
    ctx.fillStyle = 'black';
    ctx.font = 'bold 70px Trebuchet MS';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeText, 325, 50); // Wyśrodkowanie tekstu

    // Podpisy pod dniami, godzinami, minutami i sekundami
    ctx.fillStyle = 'black';
    ctx.font = 'normal 20px Trebuchet MS';

    // Dni
    ctx.fillText('DNI', 100, 100);

    // Godziny
    ctx.fillText('GODZIN', 255, 100);

    // Minuty
    ctx.fillText('MINUT', 400, 100);

    // Sekundy
    ctx.fillText('SEKUND', 550, 100);

    // Dodanie klatki do GIF-a
    encoder.addFrame(ctx);

    // Kolejna klatka za 1 sekundę
    setTimeout(updateCountdown, 1000);
  };

  // Rozpoczęcie odliczania
  updateCountdown();
});

app.listen(PORT, () => {
  console.log(`🚀 Serwer działa na http://localhost:${PORT}/countdown.gif?date=2025-04-10T12:00:00`);
});
